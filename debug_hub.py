#!/usr/bin/env python3
"""Relay Hub - Python version with debug logging"""
import json
import socket
import threading
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.error

PORT = 18080

agents = {
    'xinghuo': {'sidecar': 'http://192.168.10.195:18081/webhook/agent'},
    'huohuo':  {'sidecar': 'http://192.168.10.201:18081/webhook/agent'},
    'qiming':  {'sidecar': 'http://192.168.10.203:18081/webhook/agent'},
}

topic_rounds = {}
topic_originator = {}
lock = threading.Lock()

def log(msg):
    print(f'[Hub] {msg}', flush=True)

def forward_to_sidecar(target_sidecar, body):
    try:
        data = json.dumps(body).encode()
        req = urllib.request.Request(
            target_sidecar,
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        log(f'Forwarding to {target_sidecar}')
        with urllib.request.urlopen(req, timeout=10) as resp:
            log(f'Forward success: {resp.status}')
            return resp.status
    except urllib.error.URLError as e:
        log(f'Forward error (URL): {e}')
        return 500
    except socket.timeout:
        log(f'Forward timeout: {target_sidecar}')
        return 500
    except Exception as e:
        log(f'Forward error: {e}')
        return 500

class RelayHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode()
        msg = json.loads(body)
        tid = msg.get('topic', '')
        log(f'POST {self.path} topic={tid} sender={msg.get("sender","")} target={msg.get("target","")}')

        if self.path == '/relay':
            sender = msg.get('sender', '')
            with lock:
                topic_rounds[tid] = topic_rounds.get(tid, 0) + 1
                topic_originator[tid] = sender
                rnd = topic_rounds[tid]
            log(f'Round {rnd} for topic {tid}')

            if rnd > 5:
                self.send_response(429)
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Max rounds'}).encode())
                return

            target = agents.get(msg.get('target', ''))
            if not target:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Agent not found'}).encode())
                return

            forward_body = {
                'sender': sender,
                'topic': tid,
                'content': msg.get('content', '')
            }
            log(f'Forwarding to {target["sidecar"]}')
            status = forward_to_sidecar(target['sidecar'], forward_body)
            log(f'Forward complete, responding to caller')
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok', 'round': rnd}).encode())

        elif self.path == '/result':
            originator = topic_originator.get(tid, 'xinghuo')
            target = agents.get(originator)
            if target:
                forward_body = {
                    'sender': msg.get('sender', ''),
                    'topic': tid,
                    'content': msg.get('content', '')
                }
                threading.Thread(target=forward_to_sidecar, args=(target['sidecar'], forward_body)).start()
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode())

    def do_GET(self):
        if self.path == '/agents':
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps({'agents': list(agents.keys())}).encode())
        elif self.path == '/health':
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        print(f'[Hub] {format % args}', flush=True)

HTTPServer(('0.0.0.0', PORT), RelayHandler).serve_forever()
