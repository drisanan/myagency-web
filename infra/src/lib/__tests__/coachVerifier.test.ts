import { decodeHtml, extractCoachRows, normalizeName, selectLandingPage, stripTags } from '../coachVerifier';

describe('coachVerifier helpers', () => {
  test('normalizeName strips non-letters and lowercases', () => {
    expect(normalizeName('Mark Hernandez')).toBe('markhernandez');
    expect(normalizeName('Louis. Whitlow Jr.')).toBe('louiswhitlowjr');
  });

  test('stripTags removes tags and decodes entities', () => {
    expect(stripTags('<td>Mark&nbsp;Hernandez</td>')).toBe('Mark Hernandez');
    expect(decodeHtml('A &amp; M')).toBe('A & M');
  });

  test('extractCoachRows parses table rows', () => {
    const html = `
      <table>
        <tr>
          <th>Name</th><th>Title</th><th>Email Address</th>
        </tr>
        <tr>
          <td>Louis Whitlow</td>
          <td>Head Coach</td>
          <td><a href="mailto:Louis.whitlow@aamu.edu">Louis.whitlow@aamu.edu</a></td>
        </tr>
        <tr>
          <td>Mark Hernandez</td>
          <td>Pitching Coach / Recruiting Coordinator</td>
          <td><a href="mailto:mark.hernandez@aamu.edu">mark.hernandez@aamu.edu</a></td>
        </tr>
      </table>
    `;
    const rows = extractCoachRows(html);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ name: 'Louis Whitlow', title: 'Head Coach', email: 'Louis.whitlow@aamu.edu' });
    expect(rows[1]).toMatchObject({ name: 'Mark Hernandez', email: 'mark.hernandez@aamu.edu' });
  });

  test('selectLandingPage picks first valid url', () => {
    const landing = selectLandingPage({ landingPage: 'not-a-url', LandingPage: 'https://example.edu/sport' });
    expect(landing).toBe('https://example.edu/sport');
  });
});

