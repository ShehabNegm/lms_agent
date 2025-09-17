#!/usr/bin/python3
import os
import json
import asyncio
import subprocess
from datetime import datetime
from playwright.async_api import async_playwright
from pdf_downloader import download_pdf_directly
from whatsapp_payload import build_payload

# Load configuration from config.json
with open("config.json", "r") as f:
    config = json.load(f)

USERNAME = config.get("username")
PASSWORD = config.get("password")
LOGIN_URL = config.get("login_url")
DASHBOARD_URL = config.get("dashboard_url")
TARGET_DATE = config.get("target_date")
BASE_URL = config.get("base_url")

if not TARGET_DATE:
    TARGET_DATE = datetime.today().strftime('%d/%m/%Y')

BASE_DOWNLOAD_DIR = os.path.join(os.getcwd(), "DownloadedSubjects")

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(accept_downloads=True)
        page = await context.new_page()

        # Login
        await page.goto(LOGIN_URL)
        await page.fill('input[name="LoginName"]', USERNAME)
        await page.fill('input[name="Password"]', PASSWORD)
        await page.click('input#m_login_signin_submit')

        # Go to dashboard
        await page.goto(DASHBOARD_URL)

        # Get all subject blocks
        subject_blocks = await page.query_selector_all("div.m-tabs-content")  # Adjust if needed

        found_target_date = False

        for block in subject_blocks:
            subject_el = await block.query_selector("a.mb-1.text-gray-900.text-hover-primary.fw-bold")
            date_el = await block.query_selector("span.mb-2.fw-bold.fs-6")
            link_els = await block.query_selector_all("div.m-widget4__img.m-widget4__img--icon a[href]")

            if not subject_el or not date_el:
                continue

            subject_name = (await subject_el.inner_text()).replace("Content For", "").strip()
            date_text = await date_el.inner_text()
            date_part = date_text.split()[0].strip()

            if date_part != TARGET_DATE:
                continue

            found_target_date = True
            dated_subfolder = os.path.join(BASE_DOWNLOAD_DIR, subject_name, TARGET_DATE.replace("/", "-"))
            os.makedirs(dated_subfolder, exist_ok=True)

            for link_el in link_els:
                href = await link_el.get_attribute("href")
                if not href:
                    continue

                if href.endswith(".pdf"):
                    await download_pdf_directly(href, subject_name, TARGET_DATE, BASE_URL)
                else:
                    async with page.expect_download() as download_info:
                        await link_el.click()
                    download = await download_info.value
                    download_path = os.path.join(dated_subfolder, download.suggested_filename)
                    await download.save_as(download_path)
                    print(f"Downloaded: {download_path}")

	    # Extract comment if available
            comment_el = await block.query_selector("div.col-lg-9.col-md-9.col-sm-9 label.col-form-label p")
            if comment_el:
                comment_text = await comment_el.inner_text()
                comment_path = os.path.join(dated_subfolder, "comment.txt")
                with open(comment_path, "w", encoding="utf-8") as f:
                    f.write(comment_text.strip()) 


        await browser.close()

        # logic to prepare message for sending to whatsapp group
        # on confirmation this will send the message to the target group
        if found_target_date:
            choice = input("🛠️ Do you want to build the WhatsApp payload? (y/n): ").strip().lower()
            if choice == "y":
                build_payload(BASE_DOWNLOAD_DIR, TARGET_DATE)
                print("✅ WhatsApp payload prepared.")

                send_choice = input("📤 Do you want to send the message to the WhatsApp group? (y/n): ").strip().lower()
                if send_choice == "y":
                    subprocess.run(["node", "send_whatsapp.js"])
                    print("🎉 WhatsApp message sent.")
                else:
                    print("🚫 Message sending skipped.")
            else:
                print("🚫 Payload building skipped.")
        else:
            print(f"⚠️ No content found for target date: {TARGET_DATE}")

if __name__ == "__main__":
    asyncio.run(run())

