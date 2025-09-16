#!/usr/bin/python3
import os
import json
import asyncio
from datetime import datetime
from playwright.async_api import async_playwright
from pdf_downloader import download_pdf_directly

# Load configuration from config.json
with open("config.json", "r") as f:
    config = json.load(f)

USERNAME = config.get("username")
PASSWORD = config.get("password")
LOGIN_URL = config.get("login_url")
DASHBOARD_URL = config.get("dashboard_url")
TARGET_DATE = config.get("target_date")
BASE_URL = config.get("base_url")

# If no target date is provided, use today's date in D/MM/YYYY format
if not TARGET_DATE:
    TARGET_DATE = datetime.today().strftime('%d/%m/%Y')

# Directory to save downloaded files
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
        #await page.wait_for_load_state("networkidle")

        # Go to dashboard
        await page.goto(DASHBOARD_URL)
        #await page.locator('//*[@id="divParent-student-menuToHide"]/div/div/div/div[2]/div/a[2]').click()
        #await page.wait_for_load_state("networkidle")

        # Extract subjects, dates, and download links
        subject_elements = await page.query_selector_all("a.mb-1.text-gray-900.text-hover-primary.fw-bold")
        #date_elements = await page.query_selector_all("span.col-3.text-right.pr-3.py-2")
        date_elements = await page.query_selector_all("span.mb-2.fw-bold.fs-6")
        #link_elements = await page.query_selector_all("div.m-widget4__items a[href]")
        link_elements = await page.query_selector_all("div.m-widget4__img.m-widget4__img--icon a[href]")

        subjects = [await el.inner_text() for el in subject_elements]
        dates = [await el.inner_text() for el in date_elements]
        links = [await el.get_attribute("href") for el in link_elements]
        print(subjects)
        print(dates)
        print(links)

        found_target_date = False

        for subject, date in zip(subjects, dates):
            date_part = date.split()[0].strip()  # Extract D/MM/YYYY
            if date_part == TARGET_DATE:
                found_target_date = True
                for href in links:
                    if href:
                        subject_name = subject.replace("Content For", "").strip()
                        subject_folder = os.path.join(BASE_DOWNLOAD_DIR, subject_name)
                        dated_subfolder = os.path.join(subject_folder, TARGET_DATE.replace("/", "-"))
                        os.makedirs(dated_subfolder, exist_ok=True)
                        if href.endswith(".pdf"):
                            await download_pdf_directly(href, subject_name, TARGET_DATE, BASE_URL)
                        else:

                            async with page.expect_download() as download_info:
                                await page.click(f'a[href="{href}"]')
                            download = await download_info.value
                            download_path = os.path.join(dated_subfolder, download.suggested_filename)
                            await download.save_as(download_path)
                            print(f"Downloaded: {download_path}")
            else:
                #if found_target_date:
                print("Encountered a different date. Stopping further downloads.")
                break

        if not found_target_date:
            print(f"No content found for target date: {TARGET_DATE}")

        await browser.close()

# Run the script
if __name__ == "__main__":
    asyncio.run(run())
