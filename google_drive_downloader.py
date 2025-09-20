#google_drive_downloader.py

import os
import re
import aiohttp
import mimetypes

def extract_drive_id(url: str) -> str:
    match = re.search(r'/d/([a-zA-Z0-9_-]+)', url)
    return match.group(1) if match else None

def extract_filename_from_disposition(disposition: str) -> str:
    if not disposition:
        return None
    match = re.search(r'filename="(.+)"', disposition)
    return match.group(1) if match else None

async def download_drive_file(href, subject_name, target_date, base_dir="DownloadedSubjects"):
    file_id = extract_drive_id(href)
    if not file_id:
        print(f"⚠️ Invalid Google Drive URL: {href}")
        return

    dated_subfolder = os.path.join(base_dir, subject_name, target_date.replace("/", "-"))
    os.makedirs(dated_subfolder, exist_ok=True)

    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(download_url) as resp:
                if resp.status == 200:
                    disposition = resp.headers.get("Content-Disposition", "")
                    filename = extract_filename_from_disposition(disposition)

                    if not filename:
                        content_type = resp.headers.get("Content-Type", "")
                        extension = mimetypes.guess_extension(content_type) or ".pdf"
                        filename = f"drive_file_{file_id}{extension}"

                    save_path = os.path.join(dated_subfolder, filename)
                    content = await resp.read()
                    with open(save_path, "wb") as f:
                        f.write(content)

                    print(f"📥 Google Drive file downloaded: {save_path}")
                else:
                    print(f"❌ Failed to download: {download_url} (Status: {resp.status})")
    except Exception as e:
        print(f"❌ Error downloading Google Drive file: {e}")

