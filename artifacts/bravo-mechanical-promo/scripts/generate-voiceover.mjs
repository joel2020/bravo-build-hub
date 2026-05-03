import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ReplitConnectors } from "@replit/connectors-sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'voiceover.mp3');

const SCRIPT_TEXT = "When your heat or AC fails, you need a partner you can trust. Bravo Mechanical is your five-star HVAC team, serving Yonkers, White Plains, New Rochelle, and thirty towns across Westchester County. We install and repair furnaces, boilers, air conditioners, heat pumps, and ductless mini-splits. Fully licensed, fully insured, and brand-agnostic, so we recommend what's right for your home, not our bottom line. And because emergencies don't wait, neither do we. Twenty-four-seven service keeps your family comfortable, day and night. Call us today at nine-one-four, three-six-one, nine-one-four-two. Or visit bravo mechanical n y dot com. Bravo Mechanical. Your comfort is our commitment.";

const VOICE_ID = "pqHfZKP75CvOlQylNhV4"; // Bill - Wise, Mature, Balanced (advertisement)

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  if (fs.existsSync(OUTPUT_FILE) && process.env.FORCE_VOICEOVER !== '1') {
    console.log('voiceover.mp3 already exists. Use FORCE_VOICEOVER=1 to regenerate.');
    return;
  }

  console.log('Generating voiceover with ElevenLabs...');
  const connectors = new ReplitConnectors();

  async function tts(model_id) {
    return connectors.proxy("elevenlabs", `/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: SCRIPT_TEXT,
        model_id,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
  }

  try {
    let res = await tts("eleven_multilingual_v2");
    if (!res.ok) {
      console.warn(`eleven_multilingual_v2 failed (${res.status}); trying eleven_turbo_v2_5...`);
      res = await tts("eleven_turbo_v2_5");
    }

    if (!res.ok) {
      throw new Error(`Failed to generate voiceover: ${res.status} ${await res.text()}`);
    }

    const buffer = await res.arrayBuffer();
    fs.writeFileSync(OUTPUT_FILE, Buffer.from(buffer));
    console.log('Successfully generated voiceover.mp3');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
