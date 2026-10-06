"""Regenerate self-contained profile artwork: python3 scripts/generate_profile.py."""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'assets' / 'profile'
THEMES = {
    'light': dict(bg='#FAF8F7', panel='#FFFFFF', ink='#343030', muted='#776B67', line='#DDD5D1', accent='#F4C2D7', peach='#F7C8A5', lavender='#CEC4F4', accent_text='#8B4565', peach_text='#925A36', lavender_text='#68588D', on_accent='#30272B', soft='#F3E9E4', wash='#EEE8E5'),
    'dark': dict(bg='#211E1E', panel='#171515', ink='#DDD8D6', muted='#A59A97', line='#3A3535', accent='#F4C2D7', peach='#F7C8A5', lavender='#CEC4F4', accent_text='#F4C2D7', peach_text='#F7C8A5', lavender_text='#CEC4F4', on_accent='#30272B', soft='#322B28', wash='#2C2828'),
}

def text(x, y, value, size=14, color='ink', weight=400, serif=False, **attrs):
    if color in ('accent', 'peach', 'lavender'):
        color += '_text'
    extra = ' '.join(f'{key.replace("_", "-")}="{escape(str(val), quote=True)}"' for key, val in attrs.items())
    font = "Georgia, 'Times New Roman', serif" if serif else "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
    return f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" font-weight="{weight}" fill="{{{color}}}" {extra}>{escape(value)}</text>'

def rect(x, y, w, h, fill='panel', radius=12, stroke=None):
    edge = f' stroke="{{{stroke}}}"' if stroke else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{{{fill}}}"{edge}/>'

def svg(name, width, height, label, body):
    for mode, colors in THEMES.items():
        content = body
        for key, value in colors.items():
            content = content.replace('{' + key + '}', value)
        source = f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title"><title id="title">{escape(label)}</title>{content}</svg>\n'
        (ROOT / f'{name}-{mode}.svg').write_text(source)

def frame(w, h):
    return rect(.5, .5, w-1, h-1, 'bg', 12, 'line')

def icon(name, x, y, size=30):
    paths = {
        'TypeScript': '<rect width="24" height="24" rx="4" fill="{accent}"/><text x="4" y="18" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="{on_accent}">TS</text>',
        'React': '<g fill="none" stroke="currentColor" stroke-width="1.3"><ellipse cx="12" cy="12" rx="11" ry="4.2"/><ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(120 12 12)"/></g><circle cx="12" cy="12" r="2" fill="currentColor"/>',
        'TanStack': '<path d="M2 18L8 6L13 15L17 9L23 18Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="19" cy="5" r="2.5" fill="currentColor"/>',
        'Tailwind CSS': '<path d="M12 5C8 5 6 7 5 11C6.5 9 8 8.5 10 9.5C11 10 12 12 15 12C19 12 21 10 22 6C20.5 8 19 8.5 17 7.5C16 7 15 5 12 5ZM7 12C3 12 1 14 0 18C1.5 16 3 15.5 5 16.5C6 17 7 19 10 19C14 19 16 17 17 13C15.5 15 14 15.5 12 14.5C11 14 10 12 7 12Z" fill="currentColor"/>',
        'Framer': '<path d="M4 0H20V8H12L20 16H12V24L4 16V8H12Z" fill="currentColor"/>',
        'Webflow': '<path d="M24 5L16.3 20H9.2L12.4 13.8H12.2C9.6 17.3 5.8 19.6 0 20L3.3 13.4C3.3 13.4 5.7 13.2 7.1 11.7H1.9L5.4 5H11.7L8.8 11.1H9C11.4 7.7 14.7 5 19.5 5L16.7 11.1H16.9C18.9 7.7 21.5 5 24 5Z" fill="currentColor"/>',
    }
    return f'<g transform="translate({x} {y}) scale({size/24})" color="{{accent_text}}">{paths[name]}</g>'

def pill(x, y, label, width):
    return rect(x, y, width, 25, 'wash', 7) + text(x+10, y+17, label, 11, 'muted', 500)

def generate():
    ROOT.mkdir(parents=True, exist_ok=True)

    actions = [
        ('email', 'Contact me', 144, '<rect x="0" y="2" width="18" height="14" rx="3"/><path d="M1 4L9 10L17 4"/>'),
        ('portfolio', 'Portfolio', 126, '<circle cx="9" cy="9" r="8"/><ellipse cx="9" cy="9" rx="3.5" ry="8"/><path d="M1 9H17"/>'),
        ('upwork', 'Work with me', 158, '<path d="M1 3V10C1 17 9 17 9 10V3M9 9C11 2 19 3 19 9C19 15 12 17 9 9"/>'),
        ('telegram', '', 42, '<path d="M1 8L19 1L15 18L9 12L5 15L6 10L15 4L9 12Z"/>'),
    ]
    for name, label, width, path in actions:
        primary = name == 'email'
        fill, ink = ('accent', 'on_accent') if primary else ('bg', 'ink')
        icon_color = ink if primary else ('lavender_text' if name in ('portfolio', 'telegram') else 'peach_text')
        button = rect(.5, .5, width-1, 41, fill, 10, 'line')
        button += f'<g transform="translate(12 12)" fill="none" stroke="{{{icon_color}}}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">{path}</g>'
        if label:
            button += text(40, 26, label, 14, ink, 600)
        svg(f'button-{name}', width, 42, label or 'Telegram', button)

    for name, title, subtitle, date, lines, accent in [
        ('upwork', 'Upwork', 'Freelance Frontend Developer', 'Jun 2024 – present', ['Building responsive web interfaces with React and', 'TypeScript, plus Framer and Webflow websites.'], 'accent'),
        ('education', 'Odesa National Polytechnic', 'Computer Science · University', '2022–2026', ['Computer Science degree with honors.', 'Additional courses: JavaScript, HTML and CSS.'], 'peach'),
    ]:
        card = frame(496, 124) + rect(20, 20, 40, 40, accent, 10)
        if name == 'upwork':
            card += '<g transform="translate(28 29)" fill="none" stroke="{on_accent}" stroke-width="2.5" stroke-linecap="round"><path d="M1 0V12C1 20 12 20 12 12V0M12 8C16-1 26 1 24 10C22 18 15 18 12 8"/></g>'
        else:
            card += '<g transform="translate(28 28)" fill="none" stroke="{on_accent}" stroke-width="1.7" stroke-linejoin="round"><path d="M0 8L12 2L24 8L12 14Z M5 11V19Q12 24 19 19V11M24 8V19"/></g>'
        card += text(74, 36, title, 16, weight=600)
        card += text(74, 57, subtitle, 12, 'muted')
        card += text(476, 36, date, 11, 'muted', text_anchor='end')
        card += text(20, 95, lines[0], 12.5, 'muted') + text(20, 113, lines[1], 12.5, 'muted')
        svg(f'experience-{name}', 496, 124, f'{title}: {subtitle}, {date}. {" ".join(lines)}', card)
        mobile = frame(496, 320)
        mobile += rect(20, 20, 6, 48, accent, 3)
        if name == 'upwork':
            mobile += text(44, 54, 'Upwork', 34, weight=600)
            mobile += text(20, 112, 'Freelance', 28, 'muted') + text(20, 150, 'Frontend Developer', 28, 'muted')
            mobile += text(20, 196, date, 25, accent)
            mobile += text(20, 256, 'React · TypeScript', 26, 'muted') + text(20, 292, 'Framer · Webflow', 26, 'muted')
        else:
            mobile += text(44, 54, 'Education', 34, weight=600)
            mobile += text(20, 110, 'Odesa National', 29, weight=600) + text(20, 148, 'Polytechnic University', 29, weight=600)
            mobile += text(20, 194, date, 25, accent)
            mobile += text(20, 255, 'Computer Science', 27, 'muted') + text(20, 292, 'Degree with honors', 25, 'muted')
        svg(f'experience-{name}-mobile', 496, 320, f'{title}: {subtitle}, {date}.', mobile)

    tools = [('TypeScript', 145), ('React', 109), ('TanStack', 142), ('Tailwind CSS', 171), ('Framer', 126), ('Webflow', 138)]
    for i, (tool, width) in enumerate(tools):
        badge = rect(.5, .5, width-1, 45, 'bg', 10, 'line')
        mark = icon(tool, 12, 11, 24)
        mark = mark.replace('{accent_text}', '{' + ('accent_text', 'peach_text', 'lavender_text')[i % 3] + '}')
        badge += mark + text(47, 29, tool, 15, weight=600)
        svg('tool-'+tool.lower().replace(' ', '-'), width, 46, tool, badge)

    projects = [
        ('boogadee', 'Boogadee', 'React · TypeScript · Next.js', ['Childcare search and waitlist platform for families', 'and providers. Built with Supabase, Tailwind and Leaflet.'], 'Live website', 'peach'),
        ('kida', 'kida-ui', 'TypeScript · React · CSS', ['Animation-first UI components with a shared motion', 'engine, CSS styles, a React adapter and Astro docs.'], 'Open source · pre-alpha', 'accent'),
    ]
    for name, title, stack, lines, cta, accent in projects:
        card = f'<defs><radialGradient id="glow" cx="1" cy="0" r=".85"><stop offset="0" stop-color="{{{accent}}}" stop-opacity=".14"/><stop offset="1" stop-color="{{{accent}}}" stop-opacity="0"/></radialGradient></defs>'
        card += frame(496, 168) + '<rect x=".5" y=".5" width="495" height="167" rx="12" fill="url(#glow)"/>'
        card += rect(20, 20, 48, 48, 'panel', 12)
        if name == 'boogadee':
            card += text(44, 55, 'B', 30, accent, 700, text_anchor='middle')
        else:
            card += '<path d="M35 29V59M35 46L49 34M35 46L49 59" stroke="{accent_text}" stroke-width="3" stroke-linecap="round" fill="none"/>'
        card += text(82, 41, title, 20, weight=600)
        card += '<circle cx="86" cy="58" r="3.5" fill="{lavender}"/>' + text(96, 62, stack, 12, 'muted')
        card += text(20, 98, lines[0], 13, 'muted') + text(20, 118, lines[1], 13, 'muted')
        card += text(20, 148, cta, 12, accent, 600)
        card += f'<path d="M456 142H471M465 136L471 142L465 148" fill="none" stroke="{{{accent}_text}}" stroke-width="1.6"/>'
        svg(f'project-{name}', 496, 168, f'{title}: {" ".join(lines)} {cta}.', card)
        mobile = frame(496, 340) + rect(20, 20, 6, 48, accent, 3)
        mobile += text(44, 54, title, 35, weight=600)
        mobile += text(20, 104, 'React · TypeScript' if name == 'boogadee' else 'TypeScript · React · CSS', 23, 'muted')
        mobile_lines = ['Childcare search and', 'waitlist platform for', 'families and providers.'] if name == 'boogadee' else ['Animation-first UI.', 'Shared motion engine,', 'styles and React adapter.']
        for i, line in enumerate(mobile_lines):
            mobile += text(20, 162+i*36, line, 27, 'muted')
        mobile += text(20, 306, cta, 23, accent, 600)
        svg(f'project-{name}-mobile', 496, 340, f'{title}: {" ".join(lines)} {cta}.', mobile)
    print(f'Generated {len(list(ROOT.glob("*.svg")))} SVG assets.')

if __name__ == '__main__':
    generate()
