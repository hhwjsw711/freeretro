import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";

export function About() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-12">
        <Link to="/" className="text-cf-orange mb-8 hover:underline hover:underline-offset-4">
          ← 返回
        </Link>

        <article className="space-y-6">
          <header>
            <h1 className="text-cf-text text-5xl font-black tracking-tight sm:text-6xl">
              什么是四省？
            </h1>
          </header>

          <p className="text-cf-text-muted text-lg leading-8">
            四省是一个轻量级的团队省思工具，帮助团队成员对工作进行结构化反思。
          </p>

          <p className="text-cf-text-muted text-lg leading-8">
            省思的核心理念是创造安全的交流空间，让每个人都能坦诚地讨论哪些地方做得好、哪些
            地方有改进空间，以及下次可以如何做得更好。
          </p>

          <p className="text-cf-text-muted text-lg leading-8">
            四省的名字取自《论语》"吾日三省吾身"，寓意多角度、多层次地审视和反思。工具内置
            四列看板，对应四次审视：亮点、挑战、提问、备忘。
          </p>

          <p className="text-cf-text-muted text-lg leading-8">
            每次省思会生成一个无法猜测的唯一链接，可直接分享给团队成员，用完即弃。
          </p>

          <div className="pt-4">
            <Link
              to="/"
              className="border-cf-orange bg-cf-orange inline-flex rounded-full border px-6 py-3 font-medium text-white transition-all hover:opacity-95 active:translate-y-[1px] active:scale-[0.98]"
            >
              开始省思
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
