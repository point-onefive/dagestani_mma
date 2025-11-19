import * as cheerio from 'cheerio';

async function debugHTML() {
  const res = await fetch('http://ufcstats.com/event-details/8db1b36dde268ef6');
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('Analyzing UFC Stats HTML structure...\n');

  // Find fight rows
  const $rows = $('tbody tr.b-fight-details__table-row');
  console.log(`Total fight rows: ${$rows.length}\n`);

  if ($rows.length > 0) {
    const $firstRow = $rows.first();
    console.log('First row HTML snippet:');
    console.log($firstRow.html()?.substring(0, 500));
    console.log('\n---\n');

    // Try different selectors
    console.log('Testing selectors on first row:');
    console.log('  All <a> tags:', $firstRow.find('a').length);
    console.log('  All <p> tags:', $firstRow.find('p').length);
    console.log('  <i> tags:', $firstRow.find('i').length);
    console.log('  <td> tags:', $firstRow.find('td').length);

    console.log('\n<a> tag contents:');
    $firstRow.find('a').each((i, el) => {
      console.log(`  ${i+1}. "${$(el).text().trim()}"`);
    });

    console.log('\n<i> tag contents:');
    $firstRow.find('i').each((i, el) => {
      console.log(`  ${i+1}. class="${$(el).attr('class')}" text="${$(el).text().trim()}"`);
    });
  }
}

debugHTML();
