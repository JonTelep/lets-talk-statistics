"""Stat of the week signup: shared rules, no outbound mail."""

from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_newsletter_handlers():
    result = subprocess.run(
        ["node", "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--test", "frontend/lib/newsletter.test.mjs"],
        cwd=ROOT,
        check=False,
        text=True,
        capture_output=True,
    )
    assert result.returncode == 0, result.stdout + "\n" + result.stderr


def test_signup_does_not_send_mail():
    src = (ROOT / "frontend" / "lib" / "subscribeHandler.js").read_text(encoding="utf-8")
    assert "/emails" not in src
    assert "waitlist:" not in src


def test_footer_lists_other_sites_and_the_postal_address():
    footer = (ROOT / "frontend" / "components" / "layout" / "Footer.tsx").read_text(encoding="utf-8")
    assert "Our other sites" in footer
    assert "otherSiteLinks()" in footer
    assert "PO Box 187, Valley City, OH 44280" in footer
    assert "Stat of the week" in footer
    form = (ROOT / "frontend" / "components" / "layout" / "StatOfTheWeekForm.tsx").read_text(encoding="utf-8")
    assert 'name="email"' in form
    assert 'name="website"' in form
    assert "NEXT_PUBLIC_TURNSTILE_SITE_KEY" in form
    assert "challenges.cloudflare.com/turnstile/v0/api.js" in form
    assert "No confirmation email is sent." in form
