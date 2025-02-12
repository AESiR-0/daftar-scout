import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function page() {
    return (
        <div className="flex flex-col gap-10 h-[90vh] w-full items-center justify-center">
            <div className="">
                <video src="/videos/" controls height={800} width={600} className="" />
            </div>
            <button className="w-max-w-[30rem] capitalize text-xl bg-muted p-3 hover:bg-muted-foreground transition-all duration-300 rounded-[0.35rem] ">
                <Link href="/investor/studio">
                    Create a new Scout
                </Link>
            </button>
        </div>
    );
}
