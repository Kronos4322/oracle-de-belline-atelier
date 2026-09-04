"""Serveur local de developpement, sans cache.

    python tools/serve.py [port]

Sert le dossier du projet sur http://localhost:4173 (ou le port donne) en
desactivant le cache navigateur, pour que les modifications de CSS/JS soient
prises en compte immediatement.
"""
import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # silencieux


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    print("Oracle de Belline : http://localhost:%d  (Ctrl+C pour arreter)" % PORT)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
