"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { configOptionsByTemplate } from "@/data/projects/projectConfigs";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { projectConfig, useNewProject } from "../hooks/useNewProject";

import { OptionCard } from "./shared/OptionCard";
import { OptionGrid } from "./shared/OptionGrid";
import { PageHeader } from "./shared/PageHeader";
import { PageWrapper } from "./shared/PageWrapper";
import { SectionCard } from "./shared/SectionCard";

export default function ConfigureProject() {
  const { details, setConfig, setStep } = useNewProject();

  const configTemplate =
    configOptionsByTemplate[
      details.template as keyof typeof configOptionsByTemplate
    ];

  const [config, updateConfig] = useState<projectConfig>(
    details.config! || {
      db: true,
      auth: true,
      storage: true,
      ai: false,
      payments: "stripe",
    }
  );

  const change = (field: string, value: string | boolean) => {
    console.log(details);
    updateConfig((prev) => ({ ...prev, [field]: value }));
    setConfig({ ...config, [field]: value });
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Configure your project"
        description="Choose optional modules and integrations"
      />

      {/* AUTH */}
      {"auth" in configTemplate && (
        <SectionCard>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Enable login, signup & sessions
              </p>
            </div>
            <Switch
              checked={!!config.auth}
              onCheckedChange={(v) => change("auth", v)}
            />
          </div>
        </SectionCard>
      )}

      {/* DB */}
      {configTemplate.db?.length > 0 && (
        <SectionCard>
          <h3 className="font-semibold text-lg mb-4">Database</h3>
          <OptionGrid>
            {configTemplate.db.map((db: string) => (
              <OptionCard
                key={db}
                title={db}
                onClick={() => change("db", db)}
                selected={config.db === db}
              />
            ))}
          </OptionGrid>
        </SectionCard>
      )}

      {/* STORAGE */}
      {"storage" in configTemplate && (
        <SectionCard>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Storage</h3>
              <p className="text-sm text-muted-foreground">
                Enable file uploads & media storing
              </p>
            </div>
            <Switch
              checked={!!config.storage}
              onCheckedChange={(v) => change("storage", v)}
            />
          </div>
        </SectionCard>
      )}

      {/* AI */}
      {configTemplate.ai && (
        <SectionCard>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg mb-4">AI Integration</h3>

            <Switch
              checked={!!config.ai}
              onCheckedChange={(v) => change("ai", v ? "openai" : false)}
            />
          </div>
          {config.ai && (
            <OptionGrid>
              {Object.entries(configTemplate.ai).map(
                ([key, value]: [string, any]) => (
                  <OptionCard
                    key={key}
                    title={value.name}
                    selected={key == config.ai}
                    onClick={() => change("ai", key)}
                  />
                )
              )}
            </OptionGrid>
          )}
        </SectionCard>
      )}

      {/* PAYMENTS */}
      {configTemplate.payments?.length > 0 && (
        <SectionCard>
          <h3 className="font-semibold text-lg mb-4">Payments</h3>
          <OptionGrid>
            {configTemplate.payments.map((pm: string) => (
              <OptionCard
                key={pm}
                title={pm}
                selected={config.payments === pm}
                onClick={() => change("payments", pm)}
              />
            ))}
          </OptionGrid>
        </SectionCard>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <Button variant="secondary" onClick={() => setStep("temp")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={() => {
            setConfig(config);
            setStep("review");
          }}
          className="gap-2"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </PageWrapper>
  );
}
