# pdf_downloader.py
import os
import aiohttp

async def download_pdf_directly(href, subject_name, target_date, base_url, base_dir="DownloadedSubjects"):
    dated_subfolder = os.path.join(base_dir, subject_name, target_date.replace("/", "-"))
    os.makedirs(dated_subfolder, exist_ok=True)

    full_url = f"{base_url}{href}"
    filename = href.split("/")[-1]
    save_path = os.path.join(dated_subfolder, filename)

    async with aiohttp.ClientSession() as session:
        async with session.get(full_url) as resp:
            if resp.status == 200 and resp.headers.get("Content-Type") == "application/pdf":
                content = await resp.read()
                with open(save_path, "wb") as f:
                    f.write(content)
                print(f"✅ Downloaded: {save_path}")
            else:
                print(f"❌ Failed to download: {full_url} (Status: {resp.status})")

