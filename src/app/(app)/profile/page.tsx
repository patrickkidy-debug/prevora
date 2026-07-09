import { requireUser } from "@/lib/auth";
import { toDateKey } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const user = await requireUser();
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          {user.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={user.name ?? ""} />
          )}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user.name ?? "Mon profil"}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            values={{
              name: user.name,
              birthDate: user.birthDate ? toDateKey(user.birthDate) : null,
              sex: user.sex,
              heightCm: user.heightCm,
              weightKg: user.weightKg,
              timezone: user.timezone,
              language: user.language,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
