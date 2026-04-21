"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveProfile } from "@/lib/actions/profile";

export function ProfileForm({
  initial,
}: {
  initial: {
    displayName: string;
    handle: string;
    bio: string;
    location: string;
    momoNumber: string;
    momoNetwork: string;
  };
}) {
  const [form, setForm] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await saveProfile(form);
          if (!r.ok) toast.error(r.error ?? "Couldn't save");
          else toast.success("Profile saved");
        });
      }}
      className="mt-5 grid sm:grid-cols-2 gap-4"
    >
      <div>
        <Label>Display name</Label>
        <Input value={form.displayName} onChange={(e) => set("displayName", e.target.value)} />
      </div>
      <div>
        <Label>SBBS handle</Label>
        <Input
          leading="@"
          value={form.handle}
          onChange={(e) => set("handle", e.target.value.replace(/^@/, "").replace(/[^a-z0-9_]/gi, "").toLowerCase())}
        />
      </div>
      <div className="sm:col-span-2">
        <Label>Bio</Label>
        <Textarea
          rows={3}
          placeholder="One sentence buyers should read on your profile"
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
        />
      </div>
      <div>
        <Label>Location</Label>
        <Input
          placeholder="Accra"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
        />
      </div>
      <div>
        <Label>MoMo payout number</Label>
        <Input
          placeholder="024 000 0000"
          value={form.momoNumber}
          onChange={(e) => set("momoNumber", e.target.value)}
        />
      </div>
      <div>
        <Label>MoMo network</Label>
        <select
          className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[15px]"
          value={form.momoNetwork}
          onChange={(e) => set("momoNetwork", e.target.value)}
        >
          <option value="MTN">MTN MoMo</option>
          <option value="VOD">Telecel Cash</option>
          <option value="ATL">AT Money</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" loading={isPending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
