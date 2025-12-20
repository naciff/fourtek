ALTER TABLE server_vms ADD COLUMN IF NOT EXISTS system_id uuid REFERENCES sistemas(id);
ALTER TABLE server_vms ADD COLUMN IF NOT EXISTS domain text;
ALTER TABLE server_vms ADD COLUMN IF NOT EXISTS anydesk_id text;
ALTER TABLE server_vms ADD COLUMN IF NOT EXISTS anydesk_password text;
