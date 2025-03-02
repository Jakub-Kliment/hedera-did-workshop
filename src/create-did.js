const { 
    TopicCreateTransaction,
    PrivateKey,
    Client,
    FileId
} = require("@hashgraph/sdk");
const { HcsDid } = require("@hashgraph/did-sdk-js");
require("dotenv").config();

async function createDid() {
    try {
        // Setup a client for the testnet
        const operatorId = process.env.OPERATOR_ID;
        const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);
        if (!operatorId || !operatorKey) {
            throw new Error("Environment variables OPERATOR_ID or OPERATOR_KEY are not set properly!");
        }

        const client = Client.forTestnet();
        client.setOperator(operatorId, operatorKey);
        console.log("Operator set up properly!");

        const topicCreateTransaction = new TopicCreateTransaction()
            .setAdminKey(operatorKey)
            .setSubmitKey(operatorKey.publicKey)
            .freezeWith(client);

        const sigTx = await topicCreateTransaction.sign(operatorKey);
        const txId = await sigTx.execute(client);
        const topicId = (await txId.getReceipt(client)).topicId;

        //this.identifier = this.buildIdentifier(operatorKey.publicKey);
       
        // Create a new DID
        const didPrivateKey = HcsDid.generateDidRootKey();
        const did = new HcsDid(
            "testnet",
            didPrivateKey.publicKey,
            FileId.fromString("0.0.102"), // Default
            topicId
        );

        console.log("Registering DID...");
        const registeredDid = did.generateDidDocument();
        const didIdentifier = did.getIdString();
        console.log("DID registered successfully!");
        console.log(`DID Identifier: ${didIdentifier}`);

        // Add a service to the DID document
        console.log("Adding service to DID...");
        const serviceIdentifier = `${didIdentifier}#med-1`;
        await registeredDid.addService({
        id: serviceIdentifier,
        type: "PersonalInfoService",
        serviceEndpoint: {
            name: "Bob",
            surname: "Dillon",
            medicine: "XYZ"
        }
        });
        console.log("Service added successfully!");

        // Generate a new key pair for the verification method
        console.log("Adding verification method to DID...");
        const verificationKeyPair = PrivateKey.generate();
        const verificationPublicKey = verificationKeyPair.publicKey;
        const verificationMethodId = `${didIdentifier}#key-1`;

        // Add the verification method to your DID document
        await registeredDid.addVerificationMethod({
            id: verificationMethodId,
            type: "Ed25519VerificationKey2018",
            controller: didIdentifier,
            publicKey: verificationPublicKey,
        });
        console.log("Verification method added successfully!");

        // Link the verification method with the authentication relationship
        console.log("Linking verification method to the authentication relationship...");
        await registeredDid.addVerificationRelationship({
            id: verificationMethodId,
            relationshipType: "authentication",
            type: "Ed25519VerificationKey2018",
            controller: didIdentifier,
            publicKey: verificationPublicKey,
        });
        console.log("Verification relationship established successfully!");
        
    } catch (error) {
        console.error("An error occurred while creating the DID:", error);
    }
}

createDid();
