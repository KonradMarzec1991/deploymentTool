# Terraform Infra Scaffold

This folder is a scaffold for importing existing AWS resources into Terraform.

## Inventory
Run the inventory script to collect IDs/ARNs and current config:

```bash
bash scripts/aws-inventory.sh
```

It will create `infra/inventory/` with JSON/text outputs.

## Next
After inventory, we will:
1. Fill in `infra/envs/prod/main.tf`
2. Add modules and variables
3. Generate `terraform import` commands
