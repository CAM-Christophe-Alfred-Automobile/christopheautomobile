"use server";

import { revalidatePath } from "next/cache";
import { dismissAdvice } from "@/services/finance/advice";

export async function dismissAdviceAction(id: string) {
  await dismissAdvice(id);
  revalidatePath("/admin/finance/advice");
  revalidatePath("/admin/finance");
}
