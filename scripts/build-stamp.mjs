#!/usr/bin/env node
/**
 * Пишет public/build.json — метку версии для подвала сайта.
 *
 * Отдельным файлом, а не переменной сборки: значение из переменной попадает в
 * разметку всех 1761 страницы, и любая пересборка меняет весь сайт целиком.
 * Выкладка на сервер вуза идёт по FTP пофайлово, поэтому цена такой мелочи —
 * час заливки вместо минуты.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function sha() {
  // Сначала git, потом GITHUB_SHA: в Actions мы выкачиваем вершину ветки, а
  // GITHUB_SHA остаётся равен коммиту, которым запущен workflow, — метка врала
  // бы о том, что именно собрано.
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .trim()
      .slice(0, 7);
  } catch {
    return (process.env.GITHUB_SHA || "").slice(0, 7);
  }
}

const file = path.join(process.cwd(), "public", "build.json");
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify({ sha: sha(), iso: new Date().toISOString() }) + "\n");
console.log(`build.json: ${sha()} ${new Date().toISOString()}`);
