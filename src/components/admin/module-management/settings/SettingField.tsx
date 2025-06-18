
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface SettingDefinition {
  type: 'number' | 'boolean' | 'text' | 'textarea';
  default: any;
  label: string;
}

interface SettingFieldProps {
  settingKey: string;
  setting: SettingDefinition;
  value: any;
  onChange: (value: any) => void;
}

export function SettingField({ settingKey, setting, value, onChange }: SettingFieldProps) {
  switch (setting.type) {
    case 'boolean':
      return (
        <div className="flex items-center justify-between">
          <Label htmlFor={settingKey} className="text-sm font-medium">{setting.label}</Label>
          <Switch
            id={settingKey}
            checked={value}
            onCheckedChange={onChange}
          />
        </div>
      );
    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={settingKey} className="text-sm font-medium">{setting.label}</Label>
          <Input
            id={settingKey}
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      );
    case 'text':
      return (
        <div className="space-y-2">
          <Label htmlFor={settingKey} className="text-sm font-medium">{setting.label}</Label>
          <Input
            id={settingKey}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        </div>
      );
    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={settingKey} className="text-sm font-medium">{setting.label}</Label>
          <Textarea
            id={settingKey}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
            rows={3}
          />
        </div>
      );
    default:
      return null;
  }
}
