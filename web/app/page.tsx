import { PageActions, PageHeader, PageHeaderDescription, PageHeaderHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <div className="flex flex-col gap-3 justify-start w-full px-6">
        <PageHeader>
          <PageHeaderHeading>A Scaleable Application</PageHeaderHeading>
          <PageHeaderDescription>Full typesafe Nextjs + Elysia app using Tanstack Query to manage data. A separate worker server using BullMQ + Redis for background jobs.</PageHeaderDescription>
          <PageActions>
            <Link href="/dashboard" prefetch={true}>
              <Button asChild size="sm" className="rounded-md">
                Get Started
              </Button>
            </Link>
          </PageActions>
        </PageHeader>
        <Image priority={true} width={1300} height={500} src="https://dwdwn8b5ye.ufs.sh/f/MD2AM9SEY8GufaRuN3DtVNMJsm27v9QUujx5yHgfdS3okBpz" alt={""} />
      </div>
    </div>
  );
}
