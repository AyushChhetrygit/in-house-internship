from jinja2 import Environment, BaseLoader, TemplateSyntaxError
from typing import Dict, Any

def render_template(html_content: str, variables: Dict[str, Any]) -> str:
    """
    Dynamically renders a template with predefined variables.
    """
    try:
        env = Environment(loader=BaseLoader())
        template = env.from_string(html_content)
        return template.render(**variables)
    except TemplateSyntaxError as e:
        return f"<html><body><p>Template Syntax Error: {str(e)}</p></body></html>"
