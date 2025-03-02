const { PrivateKey, Client } = require("@hashgraph/sdk");
const { HcsDid } = require("@hashgraph/did-sdk-js");
require("dotenv").config();

async function create_did() {
  // Setup a client for the testnet
  const operatorId = process.env.OPERATOR_ID;
  const operatorKey = process.env.OPERATOR_KEY;
  if (!operatorId || !operatorKey) {
    throw new Error("Environment variables not set up properly!");
  }
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);

  console.log("\nOperator set up properly!");

  // Create a new DID
  const didPrivateKey = PrivateKey.generate();
  const did = new HcsDid({
    privateKey: didPrivateKey,
    client: client 
  });

  console.log("Registering DID...");
  const registeredDid = await did.register();
  const didIdentifier = await registeredDid.getIdentifier();
  console.log("\nDID registered successfully!");
  console.log(`DID Identifier: ${didIdentifier}`);

  // Add a service (ID) to the DID document
  console.log("\nAdding service to DID...");
  const serviceIdentifier = `${didIdentifier}#service-1`;
  await registeredDid.addService({
    id: serviceIdentifier,
    type: "PersonalInfoService",
    serviceEndpoint: {
      name: "Bob",
      surname: "Dillon",
      birthdate: "2000-03-07",
      nationality: "Swiss",
      id_number: "SW1000200"
    }
  });
  console.log("Service added successfully!");

  // Generate a new key pair for the verification method
  console.log("\nAdding verification method to DID...");
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

  // Link the verification method with an authentication relationship
  console.log("\nLinking verification method to the authentication relationship...");
  await registeredDid.addVerificationRelationship({
    id: verificationMethodId,
    relationshipType: "authentication",
    type: "Ed25519VerificationKey2018",
    controller: didIdentifier,
    publicKey: verificationPublicKey,
  });
  console.log("Verification relationship established successfully!");
}

create_did();
