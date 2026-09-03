#!/usr/bin/env python3
"""Fail closed: Task, subagents, and agent files must use cursor-grok-4.6-high."""

from __future__ import annotations

import json
import re
import sys

REQUIRED = "cursor-grok-4.6-high"
ALLOWED = {
    "cursor-grok-4.6-high",
    "grok-4.6-high",
    "cursor-grok-4.6[effort=high]",
    "cursor-grok-4.6[effort=high,fast=false]",
    "cursor-grok-4.6[fast=false,effort=high]",
}

AGENT_PATH = re.compile(
    r"(?:^|/)(?:\.cursor|\.claude|\.codex)/agents/[^/]+\.md$",
    re.IGNORECASE,
)
FRONTMATTER = re.compile(r"\A---\s*\n(.*?)\n---\s*(?:\n|$)", re.DOTALL)
MODEL_LINE = re.compile(r"^model:\s*(.+?)\s*$", re.MULTILINE | re.IGNORECASE)


def emit(payload: dict) -> None:
    sys.stdout.write(json.dumps(payload, ensure_ascii=True))
    sys.stdout.write("\n")


def deny(agent_message: str, user_message: str | None = None) -> int:
    body = {
        "permission": "deny",
        "agent_message": agent_message,
    }
    if user_message:
        body["user_message"] = user_message
    emit(body)
    return 0


def allow() -> int:
    emit({"permission": "allow"})
    return 0


def normalize(raw: object) -> str:
    if raw is None:
        return ""
    text = str(raw).strip().strip("\"'").lower()
    text = text.replace(" ", "-")
    return text


def is_allowed(raw: object) -> bool:
    text = normalize(raw)
    if not text or text in {"inherit", "auto", "fast", "default"}:
        return False
    if "4.5" in text:
        return False
    if "fast" in text and "fast=false" not in text:
        return False
    if text in ALLOWED:
        return True
    return "grok" in text and "4.6" in text and "high" in text


def tool_input(data: dict) -> dict:
    raw = data.get("tool_input")
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str) and raw.strip():
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            return {}
        if isinstance(parsed, dict):
            return parsed
    return {}


def is_agent_file(path: object) -> bool:
    if not path:
        return False
    return bool(AGENT_PATH.search(str(path).replace("\\", "/")))


def frontmatter_model(contents: object) -> str | None:
    if not isinstance(contents, str) or not contents.lstrip().startswith("---"):
        return None
    match = FRONTMATTER.search(contents)
    if not match:
        return None
    model = MODEL_LINE.search(match.group(1))
    if not model:
        return None
    return model.group(1).strip().strip("\"'")


def task_model(inp: dict) -> object:
    if "model" in inp:
        return inp.get("model")
    nested = inp.get("model_id")
    if nested:
        return nested
    return None


def handle_subagent_start(data: dict) -> int:
    model = data.get("subagent_model") or data.get("model")
    if is_allowed(model):
        return allow()
    got = model if model else "(omitted, defaults to inherit)"
    return deny(
        f"Blocked: subagent model must be {REQUIRED}. Got {got}. "
        f'Retry Task with model: "{REQUIRED}". Do not use inherit or any other model.',
        f"Subagent blocked. Only {REQUIRED} is allowed.",
    )


def handle_task(inp: dict) -> int:
    model = task_model(inp)
    if is_allowed(model):
        return allow()
    got = model if model else "(omitted, defaults to inherit)"
    return deny(
        f"Blocked: Task model must be {REQUIRED}. Got {got}. "
        f'Retry this Task call with model: "{REQUIRED}". Never omit model. Never use inherit.',
        f"Task blocked. Only {REQUIRED} is allowed.",
    )


def handle_write(inp: dict) -> int:
    path = inp.get("path")
    if not is_agent_file(path):
        return allow()
    model = frontmatter_model(inp.get("contents"))
    if is_allowed(model):
        return allow()
    got = model if model else "(missing)"
    return deny(
        f"Blocked: agent file {path} must set model: {REQUIRED} in YAML frontmatter. Got {got}.",
        f"Agent file blocked. Frontmatter must include model: {REQUIRED}.",
    )


def handle_str_replace(inp: dict) -> int:
    path = inp.get("path")
    if not is_agent_file(path):
        return allow()
    old = str(inp.get("old_string") or "")
    new = str(inp.get("new_string") or "")
    old_model = MODEL_LINE.search(old)
    new_model = MODEL_LINE.search(new)
    if new_model and not is_allowed(new_model.group(1)):
        return deny(
            f"Blocked: cannot set agent model to {new_model.group(1)!r}. Use {REQUIRED}.",
            f"Agent file blocked. Model must stay {REQUIRED}.",
        )
    if old_model and is_allowed(old_model.group(1)) and not new_model:
        return deny(
            f"Blocked: cannot remove model: {REQUIRED} from an agent file.",
            f"Agent file blocked. Keep model: {REQUIRED}.",
        )
    return allow()


def main() -> int:
    try:
        raw = sys.stdin.read()
        data = json.loads(raw) if raw.strip() else {}
        if not isinstance(data, dict):
            return deny("Blocked: hook received non-object JSON.", "Invalid hook payload.")

        event = str(data.get("hook_event_name") or "")
        name = str(data.get("tool_name") or "")
        inp = tool_input(data)

        if event == "subagentStart" or (not name and "subagent_type" in data):
            return handle_subagent_start(data)
        if name == "Task":
            return handle_task(inp)
        if name == "Write":
            return handle_write(inp)
        if name == "StrReplace":
            return handle_str_replace(inp)
        return allow()
    except Exception as exc:
        return deny(
            f"Blocked: pin-grok-46-high hook failed closed ({type(exc).__name__}: {exc}). "
            f"Retry Task with model: \"{REQUIRED}\".",
            "Subagent model hook failed closed.",
        )


if __name__ == "__main__":
    raise SystemExit(main())
