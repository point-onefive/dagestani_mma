async function main() {
  const res = await fetch('https://site.web.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard');
  const data = await res.json();
  
  const calendar = data.leagues?.[0]?.calendar;
  console.log('Calendar exists:', !!calendar);
  console.log('Calendar items:', calendar?.length || 0);
  
  if (calendar && calendar.length > 0) {
    console.log('\nFirst 5 calendar items:');
    calendar.slice(0, 5).forEach((item: any, i: number) => {
      console.log(`${i + 1}. ${item.label} - ${item.startDate}`);
    });
  }
}

main();
