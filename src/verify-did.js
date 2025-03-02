const { HcsDid } = require("@hashgraph/did-sdk-js");

async function verify_did(didIdentifier, expectedPublicKey) {
    try {
        console.log("\nResolving DID...");
        
        //get the did from the HCS
        const resolvedDid = await HcsDid.resolve(didIdentifier);

        if (!resolvedDid) {
            throw new Error("DID resolution failed! The DID may not exist.");
        }

        console.log("DID Document resolved successfully!");
        console.log(JSON.stringify(resolvedDid.toJsonTree(), null, 2));

        //get the verification methods from the did
        const verificationMethods = resolvedDid.getVerificationMethods();

        if (!verificationMethods || verificationMethods.length === 0) {
            throw new Error("No verification method found in the DID document.");
        }

        const verificationMethod = verificationMethods[0];

        console.log(`\n Found verification method: ${verificationMethod.id}`);
        console.log(` Stored Public Key: ${verificationMethod.publicKey}`);

        //Check if the expected public key matches the stored one
        if (verificationMethod.publicKey !== expectedPublicKey) {
            throw new Error(" Verification failed! The provided public key does not match.");
        }

        console.log("\n The provided public key matches the stored verification method!");

        //Ensure at least one verification relationship exists
        const relationships = resolvedDid.getVerificationRelationships();

        if (!relationships || relationships.length === 0) {
            throw new Error(" No verification relationships found in the DID document.");
        }

        console.log("\n Available Verification Relationships:");
        relationships.forEach((rel, index) => {
            console.log(`  ${index + 1}. ID: ${rel.id}, Type: ${rel.type}, Relationship: ${rel.relationshipType}`);
        });

        console.log("\n DID verification successful!");
        return true;

    } catch (error) {
        console.error(" DID verification failed:", error.message);
        return false;
    }
}
