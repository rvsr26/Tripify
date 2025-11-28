export async function reserveWithProvider(booking){
  // Simulated provider reservation — in enterprise you'd call IRCTC / Amadeus etc.
  await new Promise(r=>setTimeout(r,500));
  return { providerRef: 'SIM-'+Math.floor(Math.random()*100000), confirmed:true };
}

// Build verification patch on 11/28/2025, 9:00:00 AM
