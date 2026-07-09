import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { PushToggle } from "@/components/settings/push-toggle";
import {
  DataExportButton,
  DeleteAccountButton,
} from "@/components/settings/danger-zone";
import { MEDICAL_DISCLAIMER } from "@/config/site";

export const metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const user = await requireUser();
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos notifications, votre confidentialité et vos données.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Configurez vos rappels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PushToggle />
          <NotificationSettings
            prefs={{
              pushEnabled: prefs?.pushEnabled ?? true,
              questionnaire: prefs?.questionnaire ?? true,
              hydration: prefs?.hydration ?? true,
              activity: prefs?.activity ?? true,
              sleep: prefs?.sleep ?? true,
              medication: prefs?.medication ?? false,
              questionnaireAt: prefs?.questionnaireAt ?? "20:00",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confidentialité & données</CardTitle>
          <CardDescription>
            Vous gardez le contrôle total de vos données de santé.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{MEDICAL_DISCLAIMER}</p>
          <DataExportButton />
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Zone de danger
          </CardTitle>
          <CardDescription>
            La suppression de compte est définitive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </div>
  );
}
