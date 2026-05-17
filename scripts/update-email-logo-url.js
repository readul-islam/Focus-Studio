const fs = require('fs')

const url = 'https://focuspilot.io/public/brand/email_logo.png'
const files = [
  'client/email-templates/team-invitation-email.html',
  'client/email-templates/welcome-email.html',
  'client/public/email-templates/team-invitation-email.html',
  'client/public/email-templates/welcome-email.html',
]

const re = /src="data:image\/png;base64,[^"]+"/g

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8')
  c = c.replace(re, `src="${url}"`)
  fs.writeFileSync(f, c)
  console.log(f, c.includes(url) ? 'ok' : 'fail')
}
