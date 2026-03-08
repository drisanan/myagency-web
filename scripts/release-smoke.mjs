const apiBase = process.env.SMOKE_API_BASE_URL;
const appBase = process.env.SMOKE_APP_BASE_URL;
const publicFormToken = process.env.SMOKE_PUBLIC_FORM_TOKEN;
const publicUpdateToken = process.env.SMOKE_PUBLIC_UPDATE_TOKEN;

if (!apiBase || !appBase) {
  throw new Error('SMOKE_API_BASE_URL and SMOKE_APP_BASE_URL are required');
}

async function expectStatus(url, expectedStatus, init) {
  const response = await fetch(url, init);
  if (response.status !== expectedStatus) {
    const text = await response.text().catch(() => '');
    throw new Error(`Expected ${expectedStatus} from ${url}, got ${response.status}: ${text}`);
  }
  return response;
}

async function main() {
  await expectStatus(`${apiBase.replace(/\/$/, '')}/forms/submissions`, 401);
  await expectStatus(`${apiBase.replace(/\/$/, '')}/uploads/presigned-url`, 401, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contentType: 'image/jpeg',
      fileSize: 1024,
      clientId: 'client-smoke',
      mediaType: 'image',
    }),
  });
  await expectStatus(`${appBase.replace(/\/$/, '')}/api/commits/health`, 200);

  if (publicFormToken) {
    await expectStatus(
      `${apiBase.replace(/\/$/, '')}/forms/agency?token=${encodeURIComponent(publicFormToken)}`,
      200,
    );
  }

  if (publicUpdateToken) {
    await expectStatus(
      `${appBase.replace(/\/$/, '')}/api/update-forms/agency?token=${encodeURIComponent(publicUpdateToken)}`,
      200,
    );
  }

  console.log('Release smoke checks passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
