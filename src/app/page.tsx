import MuseumList from "@/components/MuseumList";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
          우리 아이에게 딱 맞는
          <br />
          <span className="text-blue-600">박물관</span>을 찾아보세요
        </h1>
        <p className="mt-3 text-base text-zinc-500">
          전국 35개 박물관의 정보, 교육 프로그램, 리뷰를 한눈에
        </p>
      </section>

      {/* Museum list with filters */}
      <MuseumList />
    </div>
  );
}
