const assert = require('assert');
const anchor = require('@coral-xyz/anchor');
const { SystemProgram } = anchor.web3;

describe('mycalculatordapp', () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const calculator = anchor.web3.Keypair.generate();
  const program = anchor.workspace.Mycalculatordapp;

  it('Creates a calculator', async () => {
    await program.rpc.create("Welcome to Solana", {
      accounts: {
        calculator: calculator.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId
      },
      signers: [calculator],
    });
    const account = await program.account.calculator.fetch(calculator.publicKey);
    assert.ok(account.greeting === "Welcome to Solana");
  });

  it('Adds two numbers', async () => {
    await program.rpc.add(new anchor.BN(2), new anchor.BN(3), {
      accounts: {
        calculator: calculator.publicKey
      }
    });
    const account = await program.account.calculator.fetch(calculator.publicKey);
    assert.ok(account.result.eq(new anchor.BN(5)));
  });

  it('Subtracts two numbers', async () => {
    await program.rpc.subtract(new anchor.BN(10), new anchor.BN(4), {
      accounts: {
        calculator: calculator.publicKey
      }
    });
    const account = await program.account.calculator.fetch(calculator.publicKey);
    assert.ok(account.result.eq(new anchor.BN(6)));
  });

  it('Multiplies two numbers', async () => {
    await program.rpc.multiply(new anchor.BN(4), new anchor.BN(5), {
      accounts: {
        calculator: calculator.publicKey
      }
    });
    const account = await program.account.calculator.fetch(calculator.publicKey);
    assert.ok(account.result.eq(new anchor.BN(20)));
  });

  it('Divides two numbers', async () => {
    await program.rpc.divide(new anchor.BN(20), new anchor.BN(3), {
      accounts: {
        calculator: calculator.publicKey
      }
    });
    const account = await program.account.calculator.fetch(calculator.publicKey);
    assert.ok(account.result.eq(new anchor.BN(6)));
    assert.ok(account.remainder.eq(new anchor.BN(2)));
  });

  it('Fails division by zero', async () => {
    try {
      await program.rpc.divide(new anchor.BN(20), new anchor.BN(0), {
        accounts: {
          calculator: calculator.publicKey
        }
      });
      assert.fail('Division by zero did not throw an error');
    } catch (err) {
      assert.ok(err.toString().includes("Division by zero is not allowed."));
    }
  });
});
