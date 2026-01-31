
import { Injectable, signal } from '@angular/core';

export interface Doc {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  obsolescenceScore: number; // 0-100. >80 means "Legacy/Obsolete"
  modernEquivalent?: string;
  content: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocService {
  // Mock Database of Linux Docs
  private docs: Doc[] = [
    {
      id: 'ssh-hardening',
      title: 'Securing SSH Service',
      category: 'Security',
      lastUpdated: '2023-11-10',
      obsolescenceScore: 5,
      description: 'The definitive guide to hardening OpenSSH server for production environments.',
      content: `
# Securing SSH Service

## Introduction
Secure Shell (SSH) is the primary entry point for managing Linux servers. However, a default SSH configuration is often too permissive for production environments exposed to the internet. This guide covers the essential steps to harden your SSH daemon against brute-force attacks and unauthorized access.

## 1. User Management & Permissions
**Never log in as root.** The root account is the primary target for attackers because the username is known.
Create a dedicated sudo user instead:

\`\`\`bash
adduser adminuser
usermod -aG sudo adminuser
\`\`\`

## 2. Key-Based Authentication
Passwords can be guessed or brute-forced. SSH keys provide cryptographic proof of identity.

**Generate a key pair on your local machine:**
\`\`\`bash
ssh-keygen -t ed25519 -C "admin@example.com"
\`\`\`

**Copy the public key to the server:**
\`\`\`bash
ssh-copy-id adminuser@server_ip
\`\`\`

## 3. Hardening sshd_config
Edit the main configuration file \`/etc/ssh/sshd_config\`.

### Disable Root Login
Prevent direct root access.
\`\`\`bash
PermitRootLogin no
\`\`\`

### Disable Password Authentication
Force the use of SSH keys.
\`\`\`bash
PasswordAuthentication no
ChallengeResponseAuthentication no
\`\`\`

### Restrict Auth Tries
Limit the number of authentication attempts per connection to slow down brute-force tools.
\`\`\`bash
MaxAuthTries 3
\`\`\`

### Change Default Port (Optional)
Moving SSH off port 22 reduces log noise from automated scanners (security through obscurity, but useful for log hygiene).
\`\`\`bash
Port 2222
\`\`\`

## 4. Applying Changes
Always validate the configuration before restarting to avoid locking yourself out.

\`\`\`bash
sshd -t
systemctl restart sshd
\`\`\`

## 5. Firewall Configuration (UFW)
Ensure your firewall allows traffic on the new port.

\`\`\`bash
ufw allow 2222/tcp
ufw enable
\`\`\`
      `
    },
    {
      id: 'docker-basics',
      title: 'Docker Container Basics',
      category: 'DevOps',
      lastUpdated: '2024-01-15',
      obsolescenceScore: 0,
      description: 'Introduction to running applications in containers.',
      content: `
# Docker Container Basics

## Running a Container
To run an Nginx server in the background:
\`\`\`bash
docker run -d -p 80:80 --name my-nginx nginx:alpine
\`\`\`

## Listing Containers
View running containers:
\`\`\`bash
docker ps
\`\`\`
View all containers (including stopped):
\`\`\`bash
docker ps -a
\`\`\`

## Viewing Logs
To see what's happening inside the container:
\`\`\`bash
docker logs -f my-nginx
\`\`\`
      `
    },
    {
      id: 'nginx-reverse-proxy',
      title: 'Nginx as a Reverse Proxy',
      category: 'Web Servers',
      lastUpdated: '2023-09-05',
      obsolescenceScore: 5,
      description: 'Configuring Nginx to forward traffic to backend applications.',
      content: `
# Nginx as a Reverse Proxy

## Basic Configuration
Create a new config file in \`/etc/nginx/sites-available/myapp\`:

\`\`\`nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
\`\`\`

## Enabling the Site
Link the configuration to sites-enabled:
\`\`\`bash
ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
\`\`\`
      `
    },
    {
      id: 'lvm-guide',
      title: 'Logical Volume Manager (LVM) Guide',
      category: 'Storage',
      lastUpdated: '2022-05-20',
      obsolescenceScore: 15,
      description: 'Managing disk storage flexibly with LVM.',
      content: `
# Logical Volume Manager (LVM)

## Concepts
- **PV**: Physical Volume (the raw disk)
- **VG**: Volume Group (pool of storage)
- **LV**: Logical Volume (partition you mount)

## creating LVM
1. Initialize physical volume:
\`\`\`bash
pvcreate /dev/sdb
\`\`\`

2. Create Volume Group:
\`\`\`bash
vgcreate my_vg /dev/sdb
\`\`\`

3. Create Logical Volume:
\`\`\`bash
lvcreate -L 10G -n my_data my_vg
\`\`\`

4. Format and Mount:
\`\`\`bash
mkfs.ext4 /dev/my_vg/my_data
mount /dev/my_vg/my_data /mnt/data
\`\`\`
      `
    },
    {
      id: 'cron-scheduling',
      title: 'Scheduling Tasks with Cron',
      category: 'Automation',
      lastUpdated: '2020-03-12',
      obsolescenceScore: 20,
      modernEquivalent: 'systemd timers',
      description: 'Automating scripts using the cron daemon.',
      content: `
# Scheduling Tasks with Cron

## Editing Crontab
To edit the current user's crontab:
\`\`\`bash
crontab -e
\`\`\`

## Syntax
\`\`\`text
* * * * * /path/to/command
- - - - -
| | | | |
| | | | +----- Day of week (0 - 7) (Sunday=0 or 7)
| | | +------- Month (1 - 12)
| | +--------- Day of month (1 - 31)
| +----------- Hour (0 - 23)
+------------- Minute (0 - 59)
\`\`\`

## Example: Backup every night at 3 AM
\`\`\`bash
0 3 * * * /usr/local/bin/backup.sh
\`\`\`
      `
    },
    {
      id: 'grep-mastery',
      title: 'Mastering Grep',
      category: 'CommandLine',
      lastUpdated: '2023-06-01',
      obsolescenceScore: 5,
      description: 'Searching text efficiently in Linux.',
      content: `
# Mastering Grep

## Basic Search
Search for a string in a file:
\`\`\`bash
grep "error" /var/log/syslog
\`\`\`

## Recursive Search
Search in all files in a directory:
\`\`\`bash
grep -r "config" /etc/nginx/
\`\`\`

## Regular Expressions
Search for lines starting with "User":
\`\`\`bash
grep "^User" /etc/ssh/sshd_config
\`\`\`

## Context
Show 3 lines before and after the match:
\`\`\`bash
grep -C 3 "exception" app.log
\`\`\`
      `
    },
    {
      id: 'iptables-firewall',
      title: 'Configuring Firewalls with iptables',
      category: 'Network Security',
      lastUpdated: '2009-04-12',
      obsolescenceScore: 90,
      modernEquivalent: 'nftables',
      description: 'A comprehensive guide to packet filtering using the netfilter iptables tools.',
      content: `
# Configuring Firewalls with iptables

## Introduction
iptables is the userspace command line program used to configure the Linux 2.4.x and later packet filtering ruleset. It is targeted towards system administrators.

## Basic Usage
To list the current rules, use the following command:
\`\`\`bash
iptables -L -v
\`\`\`

## Block an IP Address
To block all incoming traffic from a specific IP (e.g., 192.168.1.100):
\`\`\`bash
iptables -A INPUT -s 192.168.1.100 -j DROP
\`\`\`

## Saving Rules
On RedHat based systems, you can save the rules using:
\`\`\`bash
service iptables save
\`\`\`

## Conclusion
iptables provides a robust framework for securing your Linux server. However, rule complexity can grow quickly.
      `
    },
    {
      id: 'init-scripts',
      title: 'Writing SysV Init Scripts',
      category: 'System Administration',
      lastUpdated: '2005-08-20',
      obsolescenceScore: 95,
      modernEquivalent: 'systemd',
      description: 'How to create startup scripts in /etc/init.d for managing daemons.',
      content: `
# Writing SysV Init Scripts

## Overview
System V style init scripts are the traditional method for starting and stopping services on Linux. They live in \`/etc/init.d/\`.

## Structure of a Script
A basic script needs to handle arguments like \`start\`, \`stop\`, and \`restart\`.

\`\`\`bash
#!/bin/bash
# chkconfig: 2345 20 80
# description: Description of the service

case "$1" in
    start)
        echo "Starting my_service..."
        /usr/bin/my_service &
        ;;
    stop)
        echo "Stopping my_service..."
        killall my_service
        ;;
    *)
        echo "Usage: /etc/init.d/my_service {start|stop}"
        exit 1
        ;;
esac
\`\`\`

## Enabling the Service
Use \`chkconfig\` to add the service to the runlevels:
\`\`\`bash
chkconfig --add my_service
chkconfig my_service on
\`\`\`
      `
    },
    {
      id: 'modern-archiving',
      title: 'Archiving with Tar',
      category: 'File Management',
      lastUpdated: '2023-01-15',
      obsolescenceScore: 10,
      description: 'Standard guide for tape archives in Linux.',
      content: `
# Archiving with Tar

## Introduction
GNU tar saves many files together into a single tape or disk archive, and can restore individual files from the archive.

## Creating an Archive
To create a compressed archive of a directory:
\`\`\`bash
tar -czvf archive.tar.gz /path/to/directory
\`\`\`

## Extracting
To extract the archive:
\`\`\`bash
tar -xzvf archive.tar.gz
\`\`\`

This tool remains the standard for Linux file distribution.
      `
    },
    {
        id: 'ifconfig-guide',
        title: 'Network Configuration with ifconfig',
        category: 'Networking',
        lastUpdated: '2003-11-05',
        obsolescenceScore: 99,
        modernEquivalent: 'iproute2 (ip command)',
        description: 'Legacy guide for configuring network interfaces using ifconfig.',
        content: `
# Network Configuration with ifconfig

## Setting IP Address
To set the IP address of eth0:
\`\`\`bash
ifconfig eth0 192.168.1.5 netmask 255.255.255.0 up
\`\`\`

## Viewing Interfaces
Simply type:
\`\`\`bash
ifconfig -a
\`\`\`

## Note
This command is deprecated in many modern distributions.
        `
    },
    {
      id: 'systemd-unit-files',
      title: 'Creating Systemd Services',
      category: 'System Administration',
      lastUpdated: '2023-04-10',
      obsolescenceScore: 0,
      description: 'How to write unit files to manage custom services with systemd.',
      content: `
# Creating Systemd Services

## The Unit File
Create a file at \`/etc/systemd/system/myapp.service\`:

\`\`\`ini
[Unit]
Description=My Custom Application
After=network.target

[Service]
User=appuser
ExecStart=/usr/bin/python3 /opt/myapp/main.py
Restart=always

[Install]
WantedBy=multi-user.target
\`\`\`

## Managing the Service
Reload the daemon and start the service:
\`\`\`bash
systemctl daemon-reload
systemctl start myapp
systemctl enable myapp
\`\`\`
      `
    },
    {
      id: 'git-intro',
      title: 'Git Version Control Basics',
      category: 'DevOps',
      lastUpdated: '2024-02-01',
      obsolescenceScore: 0,
      description: 'Essential commands for git repositories.',
      content: `
# Git Version Control Basics

## Initializing
\`\`\`bash
git init
\`\`\`

## Staging and Committing
\`\`\`bash
git add .
git commit -m "Initial commit"
\`\`\`

## Branching
Create and switch to a new branch:
\`\`\`bash
git checkout -b feature/login
\`\`\`

## Merging
Merge feature branch into main:
\`\`\`bash
git checkout main
git merge feature/login
\`\`\`
      `
    }
  ];

  getAllDocs() {
    return this.docs;
  }

  getDocById(id: string) {
    return this.docs.find(d => d.id === id);
  }
}
