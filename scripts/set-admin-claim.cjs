const { applicationDefault, initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')

const email = process.argv[2]
const projectId = process.env.FIREBASE_PROJECT_ID

if (!email || !projectId) {
  console.error('Usage: set FIREBASE_PROJECT_ID and pass the account email.')
  process.exit(1)
}

async function grantAdminClaim() {
  initializeApp({ credential: applicationDefault(), projectId })
  const auth = getAuth()
  const user = await auth.getUserByEmail(email)
  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true })
  console.log(`Granted admin claim to ${user.email} (${user.uid}). Sign out and back in, or refresh the ID token, to apply it.`)
}

grantAdminClaim().catch(error => {
  console.error(error.message || error)
  process.exitCode = 1
})