import { createClient } from "@supabase/supabase-js";
import museums from "./src/data/museums.json";
import programs from "./src/data/programs.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding museums...");

  const { data: insertedMuseums, error: museumError } = await supabase
    .from("museums")
    .insert(museums)
    .select();

  if (museumError) {
    console.error("Museum insert error:", museumError);
    return;
  }

  console.log(`Inserted ${insertedMuseums.length} museums`);

  // Map museum names to IDs
  const museumIdMap = new Map<string, string>();
  for (const m of insertedMuseums) {
    museumIdMap.set(m.name, m.id);
  }

  // Insert programs with museum_id
  const programsWithIds = programs
    .map((p) => {
      const museumId = museumIdMap.get(p.museum_name);
      if (!museumId) {
        console.warn(`Museum not found: ${p.museum_name}`);
        return null;
      }
      return {
        museum_id: museumId,
        name: p.name,
        target_age: p.target_age,
        schedule: p.schedule,
        price: p.price,
        description: p.description,
      };
    })
    .filter(Boolean);

  console.log("Seeding programs...");

  const { data: insertedPrograms, error: programError } = await supabase
    .from("programs")
    .insert(programsWithIds)
    .select();

  if (programError) {
    console.error("Program insert error:", programError);
    return;
  }

  console.log(`Inserted ${insertedPrograms.length} programs`);
  console.log("Seed complete!");
}

seed();
