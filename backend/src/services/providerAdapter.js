export async function reserveWithProvider(booking){
  // Simulated provider reservation — in enterprise you'd call IRCTC / Amadeus etc.
  await new Promise(r=>setTimeout(r,500));
  return { providerRef: 'SIM-'+Math.floor(Math.random()*100000), confirmed:true };
}
