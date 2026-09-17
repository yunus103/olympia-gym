import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background bg-honeycomb px-4 text-center">
      <p className="font-display text-[10rem] font-black leading-none tracking-tight text-primary sm:text-[14rem]">404</p>
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">Bu sayfa yok</h1>
        <p className="mx-auto max-w-sm text-muted-foreground">
          Adres hatalı ya da sayfa kaldırılmış olabilir.
        </p>
      </div>
      <Button size="lg" render={<Link href="/" prefetch={false} />}>
        Ana Sayfa
      </Button>
    </div>
  );
}
