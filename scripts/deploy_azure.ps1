
# ==========================================
# LeGeZt Frontend Azure Deployment Script 
# ==========================================

$RESOURCE_GROUP = "LeGeZt-RG-IN"
$LOCATION = "centralindia"
$PLAN_NAME = "LeGeZt-Plan"
$APP_NAME = "legezt-hub-web-prod" 
$SKU = "B1" 
$RUNTIME = "NODE|20-lts"
$API_URL = "https://legezt-hub-api-prod.azurewebsites.net"

Write-Host "Starting Frontend Deployment..."

# 1. Create App Service if it doesn't exist
Write-Host "Checking if App Service exists..."
$appExists = az webapp show --resource-group $RESOURCE_GROUP --name $APP_NAME --query "name" -o tsv 2>$null

if (-not $appExists) {
    Write-Host "Creating App Service $APP_NAME..."
    az webapp create --resource-group $RESOURCE_GROUP --plan $PLAN_NAME --name $APP_NAME --runtime $RUNTIME
}

# 2. Configure App Settings
Write-Host "Configuring App Settings..."
az webapp config appsettings set --resource-group $RESOURCE_GROUP --name $APP_NAME --settings `
    NODE_ENV="production" `
    NEXT_PUBLIC_API_URL="$API_URL" `
    SCM_DO_BUILD_DURING_DEPLOYMENT="true"

# 3. Build Locally
Write-Host "Building locally..."
# Set env var for build
$env:NEXT_PUBLIC_API_URL = $API_URL
npm run build

# 4. Zip and Deploy
if (Test-Path deploy.zip) { Remove-Item deploy.zip }

Write-Host "Zipping code..."
# For Next.js on App Service, we usually deploy the whole project or use standalone mode.
# Here we'll zip the necessary files for a standard deployment.
Compress-Archive -Path .next, public, package.json, package-lock.json, next.config.js -DestinationPath deploy.zip

Write-Host "Deploying Zip..."
az webapp deployment source config-zip --resource-group $RESOURCE_GROUP --name $APP_NAME --src deploy.zip

Write-Host "Cleaning up..."
Remove-Item deploy.zip

Write-Host "DONE. Frontend deployed at: https://$APP_NAME.azurewebsites.net"
Write-Host "IMPORTANT: Update your Google OAuth Authorized Redirect URIs and Backend CORS if needed."
