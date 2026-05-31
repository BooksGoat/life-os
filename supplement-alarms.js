#!/usr/bin/env node
'use strict';
const https = require('https');

const USER = '@shalabhdewan';

const ALARMS = [
  { hour: 4,  minute: 45, text: '🌄 4:45 AM — MORNING WELLNESS\nBrew Lung Cleanse Tea and drink immediately.\nSunlight exposure at 5:00 AM. Pranayama + Hatha Yoga 5:15–6:00 AM. Cold shower at 6:00 AM.' },
  { hour: 10, minute: 0,  text: '🌅 10:00 AM — BREAKING THE FAST\nOmega-3 Fish Oil · Amla 500mg (Dose 1) · D3+K2 · Curcumin+Piperine\nEat with high-fat meal: Eggs + Avocado. No fat = no absorption.' },
  { hour: 12, minute: 0,  text: '⚡ 12:00 PM — PRE-WORKOUT FUEL\nLight snack (fruit, banana, or peanut butter)\nL-Carnitine L-Tartrate 1000mg (2 caps) + Odourless Garlic 500mg — TMAO shield active.' },
  { hour: 13, minute: 30, text: '💊 1:30 PM — PRE-WORKOUT METABOLIC BLOCKADE\nBerberine 500mg + Raw Psyllium Husk 5g in 16oz water\nEmpty stomach. 30 min before training starts.' },
  { hour: 14, minute: 0,  text: '🏋 2:00 PM — TRAINING STARTS\nElectrolyte + High-Sodium Water Matrix 500–1000mg sodium\nSip continuously. Never plain water alone during session.' },
  { hour: 15, minute: 15, text: '🔥 3:15 PM — HEAT THERAPY\nSteam / Sauna 15–20 minutes\nFlushes lactic acid, upregulates heat-shock proteins. Quick rinse after.' },
  { hour: 16, minute: 0,  text: '🥩 4:00 PM — POST-WORKOUT RECOVERY\nHeavy post-workout lunch — high protein + clean carbs\nL-Carnitine 1000mg + Garlic 500mg + Plant Sterols 1–1.5g during meal.' },
  { hour: 17, minute: 30, text: '🧘 5:30 PM — YOGA NIDRA (NSDR)\n20–30 minutes of Non-Sleep Deep Rest\nResets CNS from training load. Accelerates muscle healing.' },
  { hour: 19, minute: 30, text: '💊 7:30 PM — EVENING BLOCKADE\nBerberine 500mg + Raw Psyllium Husk 5g in 16oz water\nEmpty stomach — 30 min before dinner.' },
  { hour: 20, minute: 0,  text: '⏸ 8:00 PM — DINNER & 14-HOUR FAST BEGINS\nEat dinner. Eating window closes immediately.\nWater and herbal tea only until 10:00 AM tomorrow.' },
];

const now = new Date();
const h = now.getHours();
const m = now.getMinutes();

const alarm = ALARMS.find(a => a.hour === h && a.minute === m);
if (!alarm) process.exit(0);

const url = `https://api.callmebot.com/text.php?user=${encodeURIComponent(USER)}&text=${encodeURIComponent(alarm.text)}`;

https.get(url, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log(`[${new Date().toISOString()}] Alarm ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} sent — HTTP ${res.statusCode}`);
  });
}).on('error', e => {
  console.error(`[${new Date().toISOString()}] Alarm failed:`, e.message);
  process.exit(1);
});
