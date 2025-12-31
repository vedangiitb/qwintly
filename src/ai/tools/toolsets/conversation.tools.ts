import { commitProductChanges } from "../schemas/commitChanges.schema";
import { updateSchema } from "../schemas/updateSchema.schema";

export const conversationTools = {
  functionDeclarations: [updateSchema, commitProductChanges],
};
