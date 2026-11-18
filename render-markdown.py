"""Render local Markdown for the self-contained HTML build. Requires Markdown."""
from pathlib import Path
from urllib.parse import urlsplit
import sys

from markdown import Markdown
from markdown.treeprocessors import Treeprocessor


class SafeLinks(Treeprocessor):
    def run(self, root):
        for link in root.iter("a"):
            target = link.get("href", "")
            if urlsplit(target).scheme not in ("http", "https", "mailto"):
                link.attrib.pop("href", None)
        for image in root.iter("img"):
            image.tag = "span"
            image.text = image.get("alt", "")
            image.attrib.clear()


markdown = Markdown(extensions=["fenced_code", "tables"])
markdown.preprocessors.deregister("html_block")
markdown.inlinePatterns.deregister("html")
markdown.treeprocessors.register(SafeLinks(markdown), "safe_links", 1)
source = Path(sys.argv[1]).read_text(encoding="utf-8")
sys.stdout.buffer.write(markdown.convert(source).encode("utf-8"))
