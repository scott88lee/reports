### Project RDP Reports

#### Folder structure:
backend
frontend
tools

`npm install required` for /tools and /frontend/

### Backend:
To manage API endpoints, edit 
`swagger.yaml` and `template.yaml` / `template-staging.yaml`

#### AWS resources: 
All managed using CloudFormation except for: `arn:aws:s3:::athena-results-store`

Because the inherent data inside it cannot be changed when doing CICD
Lifecycle policy is set to daily expiry to prevent bloat.


#### Potential issues
VAT and withholding tax rate is hardcoded to be
7 and 3 pct. Update backend athena functions, and vue display
if future changes.

Txn datetime is recorded in UTC.
Current Tx queries from SG will be inaccurate.
