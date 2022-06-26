import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { CrowdFunding } from "../target/types/crowd_funding";

describe("crowdFunding", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.CrowdFunding as Program<CrowdFunding>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
