import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Museum name -> Wikimedia Commons or public domain image URL
const imageMap: Record<string, string> = {
  "국립중앙박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/National_Museum_of_Korea.jpg/640px-National_Museum_of_Korea.jpg",
  "국립과천과학관": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Gwacheon_National_Science_Museum.jpg/640px-Gwacheon_National_Science_Museum.jpg",
  "전쟁기념관": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/War_Memorial_of_Korea_main_building.jpg/640px-War_Memorial_of_Korea_main_building.jpg",
  "국립민속박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/National_Folk_Museum_of_Korea.jpg/640px-National_Folk_Museum_of_Korea.jpg",
  "국립한글박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/National_Hangeul_Museum.jpg/640px-National_Hangeul_Museum.jpg",
  "서울시립과학관": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Seoul_Science_Center_01.jpg/640px-Seoul_Science_Center_01.jpg",
  "국립중앙과학관": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/National_Science_Museum_Korea.jpg/640px-National_Science_Museum_Korea.jpg",
  "국립경주박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Gyeongju_National_Museum.jpg/640px-Gyeongju_National_Museum.jpg",
  "국립부여박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Buyeo_National_Museum.jpg/640px-Buyeo_National_Museum.jpg",
  "국립광주박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Gwangju_National_Museum_01.jpg/640px-Gwangju_National_Museum_01.jpg",
  "서울어린이대공원 내 서울상상나라": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Seoul_Children%27s_Grand_Park_01.jpg/640px-Seoul_Children%27s_Grand_Park_01.jpg",
  "국립어린이과학관": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/National_Children%27s_Science_Center.jpg/640px-National_Children%27s_Science_Center.jpg",
  "국립대구박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Daegu_National_Museum.JPG/640px-Daegu_National_Museum.JPG",
  "국립제주박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Jeju_National_Museum.jpg/640px-Jeju_National_Museum.jpg",
  "부산해양자연사박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Busan_Marine_Natural_History_Museum.jpg/640px-Busan_Marine_Natural_History_Museum.jpg",
  "한국민속촌": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Korean_Folk_Village.jpg/640px-Korean_Folk_Village.jpg",
  "경기도어린이박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Gyeonggi_Children%27s_Museum.jpg/640px-Gyeonggi_Children%27s_Museum.jpg",
  "국립춘천박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Chuncheon_National_Museum.jpg/640px-Chuncheon_National_Museum.jpg",
  "국립해양박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Korea_National_Maritime_Museum.jpg/640px-Korea_National_Maritime_Museum.jpg",
  "서대문자연사박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Seodaemun_Museum_of_Natural_History.jpg/640px-Seodaemun_Museum_of_Natural_History.jpg",
  "국립항공박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Korea_National_Aviation_Museum.jpg/640px-Korea_National_Aviation_Museum.jpg",
  "국립현대미술관 과천": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/MMCA_Gwacheon.jpg/640px-MMCA_Gwacheon.jpg",
  "삼성어린이박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Samsung_Children%27s_Museum.jpg/640px-Samsung_Children%27s_Museum.jpg",
  "국립공주박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Gongju_National_Museum.jpg/640px-Gongju_National_Museum.jpg",
  "제주항공우주박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Jeju_Aerospace_Museum_01.jpg/640px-Jeju_Aerospace_Museum_01.jpg",
  "울산대곡박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Ulsan_Daegok_Museum.jpg/640px-Ulsan_Daegok_Museum.jpg",
  "서울역사박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Seoul_Museum_of_History.jpg/640px-Seoul_Museum_of_History.jpg",
  "국립진주박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Jinju_National_Museum.jpg/640px-Jinju_National_Museum.jpg",
  "인천어린이과학관": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Incheon_Children_Science_Museum.jpg/640px-Incheon_Children_Science_Museum.jpg",
  "세종시 세종호수공원 국립세종수목원": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/National_Sejong_Arboretum.jpg/640px-National_Sejong_Arboretum.jpg",
  "대전어린이회관": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Daejeon_Children_Center.jpg/640px-Daejeon_Children_Center.jpg",
  "전주한옥마을 전통문화센터": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Jeonju_Hanok_Village_overview.jpg/640px-Jeonju_Hanok_Village_overview.jpg",
  "국립태안해양유물전시관": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Taean_Maritime_Museum.jpg/640px-Taean_Maritime_Museum.jpg",
  "광주비엔날레전시관": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Gwangju_Biennale_Exhibition_Hall.jpg/640px-Gwangju_Biennale_Exhibition_Hall.jpg",
  "국립나주박물관": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Naju_National_Museum.jpg/640px-Naju_National_Museum.jpg",
};

async function updateImages() {
  for (const [name, imageUrl] of Object.entries(imageMap)) {
    const { error } = await supabase
      .from("museums")
      .update({ image_url: imageUrl })
      .eq("name", name);

    if (error) {
      console.error(`Failed to update ${name}:`, error.message);
    } else {
      console.log(`Updated: ${name}`);
    }
  }
  console.log("Done!");
}

updateImages();
