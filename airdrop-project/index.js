const fs = require("fs");
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL
} = require("@solana/web3.js");

const KEYPAIR_PATH = "./wallet.json";

let wallet;
if (fs.existsSync(KEYPAIR_PATH)) {
  const secretKeyString = fs.readFileSync(KEYPAIR_PATH, "utf8");
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  wallet = Keypair.fromSecretKey(secretKey);
  console.log("Loaded existing wallet");
} else {
  wallet = Keypair.generate();
  fs.writeFileSync(KEYPAIR_PATH, JSON.stringify(Array.from(wallet.secretKey)));
  console.log("Created new wallet and saved keypair");
}

const publicKey = new PublicKey(wallet.publicKey);

const getWalletBalance = async (connection, publicKey) => {
  try {
    const balance = await connection.getBalance(publicKey);
    console.log(`Wallet balance is ${balance}`);
    return balance;
  } catch (err) {
    console.error("Error getting wallet balance:", err);
    return 0;
  }
};

const main = async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  let balance = await getWalletBalance(connection, publicKey);

  let delay = 1000;

  while (balance < 2 * LAMPORTS_PER_SOL) {
    try {
      console.log("Requesting airdrop...");
      const signature = await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature);
      console.log("Airdrop successful!");
      delay = 1000;
    } catch (err) {
      console.error(err);
      console.log(`Retrying after ${delay}ms delay...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
    balance = await getWalletBalance(connection, publicKey);
  }
};

main();
