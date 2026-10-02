'use client';

import * as React from 'react';
import {
  Settings,
  Mail,
  Palette,
  Check,
  Building,
  Upload,
  ShieldAlert,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useConfigStore } from '@/store/useConfigStore';

export default function ConfigPage() {
  const { appConfig, updateAppConfig, isDarkMode, toggleDarkMode, setDarkMode } =
    useConfigStore();

  const [activeTab, setActiveTab] = React.useState('general');
  const [saveToast, setSaveToast] = React.useState(false);

  // General State
  const [formData, setFormData] = React.useState({
    appName: appConfig.appName,
    organizationName: appConfig.organizationName,
    supportEmail: appConfig.supportEmail,
    maintenanceMode: appConfig.maintenanceMode,
    smtpHost: appConfig.smtpHost,
    smtpPort: appConfig.smtpPort,
    smtpUser: appConfig.smtpUser,
    smtpSenderName: appConfig.smtpSenderName,
    primaryColor: appConfig.primaryColor,
    defaultTheme: appConfig.defaultTheme,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppConfig(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Sistem (Config)"
        description="Konfigurasi identitas platform, integrasi pengiriman email notifikasi (SMTP), dan preferensi tampilan tema."
      >
        {saveToast && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            <Check className="h-3.5 w-3.5" />
            Pengaturan Berhasil Disimpan
          </span>
        )}
      </PageHeader>

      <form onSubmit={handleSave} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="general">Umum (General)</TabsTrigger>
            <TabsTrigger value="smtp">Email & SMTP</TabsTrigger>
            <TabsTrigger value="appearance">Tampilan (Tema)</TabsTrigger>
          </TabsList>

          {/* TAB 1: GENERAL */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Identitas Institusi & Platform</CardTitle>
                <CardDescription>
                  Nama aplikasi dan entitas penyelenggara ujian yang tampil di portal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-medium text-foreground">Nama Aplikasi CBT *</label>
                    <Input
                      value={formData.appName}
                      onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-foreground">Nama Lembaga / Yayasan *</label>
                    <Input
                      value={formData.organizationName}
                      onChange={(e) =>
                        setFormData({ ...formData, organizationName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-foreground">Email Bantuan Teknis</label>
                    <Input
                      type="email"
                      value={formData.supportEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, supportEmail: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-foreground">Logo Aplikasi</label>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-base">
                        CBT
                      </div>
                      <Button variant="outline" size="sm" type="button" className="text-xs gap-1.5">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Ganti Logo</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block">
                      Mode Perawatan (Maintenance Mode)
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      Kunci akses portal siswa untuk persiapan sinkronisasi bank soal besar.
                    </span>
                  </div>
                  <Switch
                    checked={formData.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, maintenanceMode: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: SMTP */}
          <TabsContent value="smtp">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Konfigurasi Mail Server (SMTP)</CardTitle>
                <CardDescription>
                  Pengaturan protokol email otomatis untuk pengiriman token dan rekap hasil tes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-medium text-foreground">SMTP Host Server</label>
                    <Input
                      placeholder="smtp.mailgun.org"
                      value={formData.smtpHost}
                      onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-foreground">SMTP Port</label>
                    <Input
                      type="number"
                      placeholder="587"
                      value={formData.smtpPort}
                      onChange={(e) =>
                        setFormData({ ...formData, smtpPort: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-foreground">Username / Akun Pengirim</label>
                    <Input
                      value={formData.smtpUser}
                      onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-foreground">Nama Pengirim (Display Name)</label>
                    <Input
                      value={formData.smtpSenderName}
                      onChange={(e) =>
                        setFormData({ ...formData, smtpSenderName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" type="button" className="text-xs gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Kirim Email Percobaan (Test Ping)</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: APPEARANCE */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pengaturan Tema & Tampilan Tweakcn</CardTitle>
                <CardDescription>
                  Kustomisasi palet warna aksen dan tema gelap/terang antarmuka.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="font-semibold text-foreground block">
                    Mode Gelap / Terang (Dark Mode):
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant={!isDarkMode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDarkMode(false)}
                      className="gap-2 text-xs"
                    >
                      <Sun className="h-3.5 w-3.5" />
                      <span>Mode Terang</span>
                    </Button>
                    <Button
                      type="button"
                      variant={isDarkMode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDarkMode(true)}
                      className="gap-2 text-xs"
                    >
                      <Moon className="h-3.5 w-3.5" />
                      <span>Mode Gelap</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/60">
                  <label className="font-semibold text-foreground block">
                    Warna Aksen Utama (Tweakcn Primary Palette):
                  </label>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg border border-border shadow-xs"
                      style={{ backgroundColor: formData.primaryColor }}
                    />
                    <div className="w-40">
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) =>
                          setFormData({ ...formData, primaryColor: e.target.value })
                        }
                        className="font-mono text-xs"
                      />
                    </div>
                    <span className="text-muted-foreground text-[11px]">
                      Default: #ff810a (Vibrant Orange Tweakcn)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="submit" className="gap-2">
            <Check className="h-4 w-4" />
            <span>Simpan Seluruh Pengaturan</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
