import os
from fpdf import FPDF

class CodebasePDF(FPDF):
    def header(self):
        # Arial bold 8
        self.set_font('Arial', 'B', 8)
        self.set_text_color(128, 128, 128)
        # Title
        self.cell(0, 5, 'Project Codebase Export', 0, 0, 'L')
        self.ln(8)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        # Arial italic 8
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        # Page number
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', 0, 0, 'C')

def sanitize_text(text):
    # Replace non-latin1 characters to avoid FPDF default font rendering errors
    # FPDF standard fonts support characters in latin-1 (0 to 255)
    chars = []
    for char in text:
        code = ord(char)
        if code <= 255:
            # Normalize common windows line endings / tabs
            if char == '\t':
                chars.append('    ') # 4 spaces for tabs
            else:
                chars.append(char)
        else:
            # Map common unicode characters
            if char == '\u2013' or char == '\u2014': # en-dash or em-dash
                chars.append('-')
            elif char in ['\u2018', '\u2019']: # curly single quotes
                chars.append("'")
            elif char in ['\u201c', '\u201d']: # curly double quotes
                chars.append('"')
            elif char == '\u2022': # bullet points
                chars.append('*')
            else:
                chars.append('?')
    return "".join(chars)

def create_codebase_pdf():
    workspace_dir = os.path.dirname(os.path.abspath(__file__))
    output_pdf = os.path.join(workspace_dir, "codebase.pdf")

    pdf = CodebasePDF()
    pdf.alias_nb_pages()
    pdf.set_margins(10, 10, 10)
    pdf.set_auto_page_break(auto=True, margin=15)

    # Cover Page
    pdf.add_page()
    pdf.set_font("Arial", "B", 24)
    pdf.set_text_color(31, 41, 55) # Dark gray
    pdf.ln(50)
    pdf.cell(0, 15, "Project Codebase Documentation", ln=True, align="C")
    
    pdf.set_font("Arial", "", 12)
    pdf.set_text_color(107, 114, 128) # Muted gray
    pdf.ln(5)
    pdf.cell(0, 10, "A compilation of all source code files in the project", ln=True, align="C")
    
    # List of files to export
    ignored_dirs = {
        ".git", "node_modules", ".venv", "venv", "dist", 
        "__pycache__", "codebase_txt", "codebase_txt_flat", "txt_copies"
    }
    ignored_files = {
        "package-lock.json", "export_to_txt.py", "generate_pdf.py", "codebase.pdf", ".DS_Store"
    }
    allowed_extensions = {
        ".js", ".jsx", ".ts", ".tsx", ".css", ".html", 
        ".json", ".py", ".md", ".env", ".yml", ".yaml", 
        ".ini", ".toml", ".txt"
    }

    files_to_print = []
    for root, dirs, files in os.walk(workspace_dir):
        dirs[:] = [d for d in dirs if d not in ignored_dirs and not d.startswith('.')]
        for file in files:
            if file in ignored_files or file.startswith('.'):
                if file != ".env":
                    continue
            _, ext = os.path.splitext(file)
            if ext.lower() not in allowed_extensions and file != ".env":
                continue
            
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, workspace_dir)
            files_to_print.append((rel_path, file_path))

    # Sort files alphabetically by relative path
    files_to_print.sort(key=lambda x: x[0])

    # Table of Contents
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.set_text_color(31, 41, 55)
    pdf.cell(0, 10, "Table of Contents", ln=True)
    pdf.ln(5)
    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(75, 85, 99)

    for i, (rel_path, _) in enumerate(files_to_print):
        # Simple TOC listing
        pdf.cell(0, 6, f"{i+1}. {rel_path}", ln=True)

    # Print files
    for rel_path, file_path in files_to_print:
        pdf.add_page()
        
        # File Title Heading
        pdf.set_font("Arial", "B", 14)
        pdf.set_text_color(79, 70, 229) # Indigo accent color
        pdf.cell(0, 10, f"File: {rel_path}", ln=True)
        
        # Divider Line
        pdf.set_draw_color(229, 231, 235) # Light gray divider
        pdf.set_line_width(0.5)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)

        # Read file content
        try:
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
        except Exception as e:
            content = f"[Could not read file contents: {e}]"

        # Print Content
        pdf.set_font("Courier", "", 8.5)
        pdf.set_text_color(55, 65, 81) # Charcoal color for code
        
        sanitized = sanitize_text(content)
        
        # Write code using multi_cell to handle wrapping
        pdf.multi_cell(0, 4, sanitized)
        pdf.ln(10)

    # Save PDF
    pdf.output(output_pdf)
    print(f"Successfully generated PDF: {output_pdf}")

if __name__ == "__main__":
    create_codebase_pdf()
