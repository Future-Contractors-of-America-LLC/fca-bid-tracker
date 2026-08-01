# Apply enterprise peer-parity patch to Auricrux/auricrux-app

```bash
git clone https://github.com/Auricrux/auricrux-app.git
cd auricrux-app
git checkout -b cursor/enterprise-peer-parity-d3e1
git am path/to/enterprise-peer-parity.patch
# or: git apply --index path/to/enterprise-peer-parity.patch && git commit

dotnet test Auricrux.Tests -c Release
# expect 65/65 PASS

git push -u origin cursor/enterprise-peer-parity-d3e1
# open PR into main
```

Smoke after deploy:

```bash
curl -s https://auricrux.futurecontractorsofamerica.com/api/capabilities | jq '.version,.parityScore.overallAssessment'
# expect version 1.3.0 and FORWARD assessment mentioning stream/projects/share/audit/safety

curl -s https://auricrux.futurecontractorsofamerica.com/api/enterprise/policy | jq '.dataUse.noTrainByDefault'
# expect true
```
