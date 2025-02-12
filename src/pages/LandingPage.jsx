import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IconCrossStroked } from "@douyinfe/semi-icons";
import SimpleCanvas from "../components/SimpleCanvas";
import Navbar from "../components/Navbar";
import { diagram } from "../data/heroDiagram";
import mysql_icon from "../assets/mysql.png";
import postgres_icon from "../assets/postgres.png";
import sqlite_icon from "../assets/sqlite.png";
import mariadb_icon from "../assets/mariadb.png";
import sql_server_icon from "../assets/sql-server.png";
import discord from "../assets/discord.png";
import github from "../assets/github.png";
import screenshot from "../assets/screenshot.png";
import FadeIn from "../animations/FadeIn";
import axios from "axios";
import { languages } from "../i18n/i18n";
import { Tweet } from "react-tweet";

function shortenNumber(number) {
  if (number < 1000) return number;

  if (number >= 1000 && number < 1_000_000)
    return `${(number / 1000).toFixed(1)}k`;
}

export default function LandingPage() {
  const [showSurvey, setShowSurvey] = useState(true);
  const [stats, setStats] = useState({ stars: 18000, forks: 1200 });

  useEffect(() => {
    const fetchStats = async () => {
      await axios
        .get("https://api.github-star-counter.workers.dev/user/drawdb-io")
        .then((res) => setStats(res.data));
    };

    document.body.setAttribute("theme-mode", "light");
    document.title = "SqiAI | 使用AI设计数据库SQL";

    fetchStats();
  }, []);

  return (
    <div>
      <div className="flex flex-col h-screen bg-zinc-100">
        <FadeIn duration={0.6}>
          <Navbar />
        </FadeIn>

        {/* Hero section */}
        <div className="flex-1 flex-col relative mx-4 md:mx-0 mb-4 rounded-3xl bg-white">
          <div className="h-full md:hidden">
            <SimpleCanvas diagram={diagram} zoom={0.85} />
          </div>
          <div className="hidden md:block h-full bg-dots" />
          <div className="absolute left-12 w-[45%] top-[50%] translate-y-[-54%] md:left-[50%] md:translate-x-[-50%] p-8 md:p-3 md:w-full text-zinc-800">
            <FadeIn duration={0.75}>
              <div className="md:px-3">
                <h1 className="text-[42px] md:text-3xl font-bold tracking-wide bg-gradient-to-r from-sky-900 from-10% via-slate-500 to-[#12495e] inline-block text-transparent bg-clip-text">
                  AI、AUTO、SQL
                </h1>
                <div className="text-lg font-medium mt-1 sliding-vertical">
                  一款AI赋能的数据库设计工具、数据建模器和SQL生成器。
                </div>
              </div>
            </FadeIn>
            <div className="mt-4 font-semibold md:mt-12">
              <button
                className="py-3 mb-4 xl:mb-0 mr-4 transition-all duration-300 bg-white border rounded-full shadow-lg px-9 border-zinc-200 hover:bg-zinc-100"
                onClick={() =>
                  document
                    .getElementById("learn-more")
                    .scrollIntoView({ behavior: "smooth" })
                }
              >
                了解更多
              </button>
              <Link
                to="/editor"
                className="inline-block py-3 text-white transition-all duration-300 rounded-full shadow-lg bg-sky-900 ps-7 pe-6 hover:bg-sky-800"
              >
                立即体验 <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Learn more */}
      <div id="learn-more">
        <div className="bg-zinc-100 py-10 px-28 md:px-8">
          <div className="mt-16 w-[75%] text-center sm:w-full mx-auto shadow-sm rounded-2xl border p-6 bg-white space-y-3">
            <div className="text-lg font-medium">
              通过AI来构建图表,查看全局视图,导出SQL脚本,自定义编辑器等等。
            </div>
            <img src={screenshot} className="mx-auto" />
          </div>
          <div className="text-lg font-medium text-center mt-12 mb-6">
            为您的数据库设计
          </div>
          <div className="flex justify-center items-center gap-8 md:block">
            {dbs.map((s, i) => (
              <img
                key={"icon-" + i}
                src={s.icon}
                style={{ height: s.height }}
                className="opacity-70 hover:opacity-100 transition-opacity duration-300 md:scale-[0.7] md:mx-auto"
              />
            ))}
          </div>
        </div>
        <svg
          viewBox="0 0 1440 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          className="bg-transparent"
        >
          <path
            d="M0 54C0 54 320 0 720 0C1080 0 1440 54 1440 54V0H0V100Z"
            fill="#f4f4f5"
          />
        </svg>
      </div>

      {/* Features */}
      <div id="features" className="py-8 px-36 md:px-8">
        <FadeIn duration={1}>
          <div className="text-base font-medium text-center text-sky-900">
            More than just an editor
          </div>
          <div className="text-2xl mt-1 font-medium text-center">
            What drawDB has to offer
          </div>
          <div className="grid grid-cols-3 gap-8 mt-10 md:grid-cols-2 sm:grid-cols-1">
            {features.map((f, i) => (
              <div
                key={"feature" + i}
                className="flex rounded-xl hover:bg-zinc-100 border border-zinc-100 shadow-sm hover:-translate-y-2 transition-all duration-300"
              >
                <div className="bg-sky-700 px-0.5 rounded-l-xl" />
                <div className="px-8 py-4 ">
                  <div className="text-lg font-semibold mb-3">{f.title}</div>
                  {f.content}
                  <div className="mt-2 text-xs opacity-60">{f.footer}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      <div className="bg-red-700 py-1 text-center text-white text-xs font-semibold px-3">
        注意! 图表保存在浏览器中。清除浏览器数据前请确保备份您的数据。
      </div>
      <hr className="border-zinc-300" />
      <div className="text-center text-sm py-3">
        &copy; 2025 <strong>SqlAI</strong> - 保留所有权利。
      </div>
    </div>
  );
}

const dbs = [
  { icon: mysql_icon, height: 80 },
  { icon: postgres_icon, height: 48 },
  { icon: sqlite_icon, height: 64 },
  { icon: mariadb_icon, height: 64 },
  { icon: sql_server_icon, height: 64 },
];

const features = [
  {
    title: "导出",
    content: (
      <div>
        导出DDL脚本以在数据库中运行,或将图表导出为JSON或图片格式。
      </div>
    ),
    footer: "",
  },
  {
    title: "反向工程",
    content: (
      <div>
        已有数据库架构? 导入DDL脚本生成图表。
      </div>
    ),
    footer: "",
  },
  {
    title: "自定义工作区",
    content: (
      <div>
        自定义界面以适应您的偏好。选择您想要在视图中显示的组件。
      </div>
    ),
    footer: "",
  },
  {
    title: "键盘快捷键",
    content: (
      <div>
        使用键盘快捷键加快开发。查看所有可用的快捷键
        <Link to="/shortcuts" className="ms-1.5 text-blue-500 hover:underline">
          这里
        </Link>
        .
      </div>
    ),
    footer: "",
  },
  {
    title: "模板",
    content: (
      <div>
        从预置模板开始。快速启动或获取设计灵感。
      </div>
    ),
    footer: "",
  },
  {
    title: "自定义模板",
    content: (
      <div>
        有常用的数据结构模板？将它们保存为模板并在需要时加载，节省您的时间。
      </div>
    ),
    footer: "",
  },
  {
    title: "强大的编辑器",
    content: (
      <div>
        撤销、重做、复制、粘贴、复制等功能。添加表格、主题区域和备注。
      </div>
    ),
    footer: "",
  },
  {
    title: "问题检测",
    content: (
      <div>
        检测并解决图表中的错误,以确保生成的脚本正确无误。
      </div>
    ),
    footer: "",
  },
  {
    title: "关系型数据库",
    content: (
      <div>
        我们支持5种关系型数据库 - MySQL、PostgreSQL、SQLite、MariaDB、
        SQL Server。
      </div>
    ),
    footer: "",
  },
  {
    title: "对象关系型数据库",
    content: (
      <div>
        为对象关系型数据库添加自定义类型，或创建自定义JSON模式。
      </div>
    ),
    footer: "",
  },
  {
    title: "演示模式",
    content: (
      <div>
        在团队会议和讨论期间在大屏幕上展示您的图表。
      </div>
    ),
    footer: "",
  },
  {
    title: "待办事项追踪",
    content: <div>跟踪任务并在完成时标记为已完成。</div>,
    footer: "",
  },
];
