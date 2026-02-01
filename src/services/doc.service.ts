
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
  sourceUrl?: string; // Link to the actual source (TLDP, Nginx.org, etc)
}

@Injectable({
  providedIn: 'root'
})
export class DocService {
  // Mock Database of Linux Docs
  // Note: All content is intentionally "Legacy" to demonstrate the AI Modernization features.
  private docs: Doc[] = [
    {
      id: 'security-howto',
      title: 'Security HOWTO',
      category: 'Security',
      lastUpdated: '2004-06-25',
      obsolescenceScore: 95,
      modernEquivalent: 'OpenSSH / Fail2Ban / UFW',
      description: 'A general overview of security issues that face the administrator of Linux systems.',
      sourceUrl: 'https://tldp.org/HOWTO/html_single/Security-HOWTO/',
      content: `
# Security HOWTO

## 5.6. Secure Shell (SSH)
SSH is a protocol for logging into and executing commands on a remote machine. It provides secure encrypted communications between two untrusted hosts over an insecure network.

### Configuration
You should disable root logins in \`/etc/ssh/sshd_config\`:

\`\`\`bash
PermitRootLogin no
\`\`\`

And ensure you are using Protocol 2, not Protocol 1 which is insecure.

### Tcp Wrappers
SSH supports TCP wrappers. You should edit \`/etc/hosts.allow\` and \`/etc/hosts.deny\` to restrict access to your sshd service.

\`\`\`text
# /etc/hosts.deny
sshd: ALL
\`\`\`

\`\`\`text
# /etc/hosts.allow
sshd: 192.168.1.0/255.255.255.0
\`\`\`
      `
    },
    {
      id: 'apache-overview',
      title: 'Apache Overview HOWTO',
      category: 'Web Servers',
      lastUpdated: '2002-10-14',
      obsolescenceScore: 90,
      modernEquivalent: 'Nginx / Caddy',
      description: 'An overview of the Apache Web Server, the standard for serving web content.',
      sourceUrl: 'https://tldp.org/HOWTO/html_single/Apache-Overview-HOWTO/',
      content: `
# Apache Overview HOWTO

## Starting Apache
Apache is usually run as a standalone daemon. You can start it using the \`apachectl\` control script.

\`\`\`bash
/usr/local/apache/bin/apachectl start
\`\`\`

## Configuration
The main configuration file is \`httpd.conf\`.

### ServerRoot
The top of the directory tree under which the server's configuration, error, and log files are kept.
\`\`\`apache
ServerRoot "/etc/httpd"
\`\`\`

### CGI Scripts
To enable CGI scripts, ensure the following is uncommented:
\`\`\`apache
AddHandler cgi-script .cgi
\`\`\`

## Performance
For high loads, you may need to adjust \`MaxClients\`. Be careful not to set this too high or you will run out of RAM.
      `
    },
    {
      id: 'cvs-rcs-howto',
      title: 'CVS-RCS HOWTO',
      category: 'DevOps',
      lastUpdated: '2001-09-21',
      obsolescenceScore: 99,
      modernEquivalent: 'Git',
      description: 'How to set up and use the Concurrent Versions System (CVS) and Revision Control System (RCS).',
      sourceUrl: 'https://tldp.org/HOWTO/html_single/CVS-RCS-HOWTO/',
      content: `
# CVS-RCS HOWTO

## Introduction
CVS (Concurrent Versions System) is the dominant open-source version control system. It is built upon RCS.

## Setting up a Repository
First, create a user and group for the repository.

\`\`\`bash
mkdir /usr/local/cvsroot
cvs -d /usr/local/cvsroot init
\`\`\`

## Basic Usage
To check out a module:
\`\`\`bash
export CVSROOT=/usr/local/cvsroot
cvs checkout myproject
\`\`\`

## Committing Changes
Once you have modified files:
\`\`\`bash
cvs commit -m "Fixed the login bug"
\`\`\`

## Remote Access
You can use the \`:pserver:\` method for remote access, though it sends passwords in cleartext.
      `
    },
    {
      id: 'lvm-howto',
      title: 'LVM HOWTO',
      category: 'Storage',
      lastUpdated: '2006-03-25',
      obsolescenceScore: 85,
      modernEquivalent: 'LVM2 (Standard)',
      description: 'Learning how to compile, install, and use the Logical Volume Manager.',
      sourceUrl: 'https://tldp.org/HOWTO/html_single/LVM-HOWTO/',
      content: `
# LVM HOWTO

## What is LVM?
LVM adds a layer of abstraction between your physical disks and your file system.

## Creating Physical Volumes
Initialize your disk partitions:
\`\`\`bash
pvcreate /dev/hda1 /dev/hdb1
\`\`\`

## Creating Volume Groups
Combine them into a volume group:
\`\`\`bash
vgcreate my_volume_group /dev/hda1 /dev/hdb1
\`\`\`

## Creating Logical Volumes
Carve out a logical volume:
\`\`\`bash
lvcreate -L1500 -nmy_logical_volume my_volume_group
\`\`\`

## File Systems
Create an ext3 file system on it:
\`\`\`bash
mke2fs -j /dev/my_volume_group/my_logical_volume
\`\`\`
      `
    },
    {
      id: 'bash-prog-intro',
      title: 'Bash-Prog-Intro HOWTO',
      category: 'Automation',
      lastUpdated: '2000-07-26',
      obsolescenceScore: 92,
      modernEquivalent: 'Modern Bash / Python / Go',
      description: 'An introduction to shell programming with Bash (Legacy constructs).',
      sourceUrl: 'https://tldp.org/HOWTO/html_single/Bash-Prog-Intro-HOWTO/',
      content: `
# Bash-Prog-Intro HOWTO

## Variables
You can assign variables like this (no spaces around the = sign):

\`\`\`bash
STR="Hello World!"
echo $STR
\`\`\`

## Loops
A basic for loop to iterate over files:

\`\`\`bash
for i in $( ls ); do
    echo item: $i
done
\`\`\`
*Note: Using $(ls) is often considered bad practice today due to filenames with spaces.*

## Conditionals
\`\`\`bash
if [ "$1" -gt "100" ]; then
    echo "That's a big number."
fi
\`\`\`
      `
    },
    {
      id: 'firewall-howto',
      title: 'Firewall HOWTO',
      category: 'Network Security',
      lastUpdated: '2004-03-08',
      obsolescenceScore: 95,
      modernEquivalent: 'nftables / ufw / firewalld',
      description: 'A guide to setting up a firewall using iptables and netfilter.',
      sourceUrl: 'https://tldp.org/HOWTO/html_single/Firewall-HOWTO/',
      content: `
# Firewall HOWTO

## ipchains vs iptables
This document focuses on **iptables**, the replacement for ipchains in Linux 2.4.

## Basic Policy
Set the default policy to DROP:
\`\`\`bash
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT
\`\`\`

## Allowing SSH
\`\`\`bash
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
\`\`\`

## Masquerading (NAT)
To share your internet connection:
\`\`\`bash
echo "1" > /proc/sys/net/ipv4/ip_forward
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
\`\`\`
      `
    },
    {
      id: 'nfs-howto',
      title: 'NFS HOWTO',
      category: 'Networking',
      lastUpdated: '2002-08-25',
      obsolescenceScore: 88,
      modernEquivalent: 'NFSv4 / Samba',
      description: 'Setting up Network File System (NFS) servers and clients.',
      sourceUrl: 'https://tldp.org/HOWTO/html_single/NFS-HOWTO/',
      content: `
# NFS HOWTO

## /etc/exports
The server configuration file is \`/etc/exports\`.

\`\`\`text
/home 192.168.0.0/255.255.255.0(rw)
/data machine1(ro)
\`\`\`

## Starting Services
You need the portmapper running.
\`\`\`bash
/etc/rc.d/init.d/portmap start
/etc/rc.d/init.d/nfs start
\`\`\`

## Mounting
On the client:
\`\`\`bash
mount -t nfs server:/home /mnt/home
\`\`\`
      `
    },
    {
      id: 'tar-backup',
      title: 'Linux Backup Strategy (SAG)',
      category: 'File Management',
      lastUpdated: '2007-03-10',
      obsolescenceScore: 85,
      modernEquivalent: 'Restic / Borg / Kopia',
      description: 'From the System Administrators Guide: Archiving with Tar.',
      sourceUrl: 'https://tldp.org/LDP/sag/html/backups.html',
      content: `
# Archiving with Tar

## Introduction
GNU tar saves many files together into a single tape or disk archive.

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

## Tape Drives
To write to a SCSI tape drive:
\`\`\`bash
tar -cvf /dev/st0 /home
\`\`\`
      `
    },
    {
      id: 'net-howto',
        title: 'Net-HOWTO',
        category: 'Networking',
        lastUpdated: '2002-08-09',
        obsolescenceScore: 99,
        modernEquivalent: 'iproute2 (ip command)',
        description: 'Detailed guide on configuring networking (Legacy).',
        sourceUrl: 'https://tldp.org/HOWTO/html_single/Net-HOWTO/',
        content: `
# Net-HOWTO

## Configuring Interfaces
The primary tool is \`ifconfig\`.

\`\`\`bash
ifconfig eth0 192.168.1.5 netmask 255.255.255.0 up
\`\`\`

## Routing
To add a default gateway:
\`\`\`bash
route add default gw 192.168.1.1
\`\`\`

## /etc/resolv.conf
Configure your DNS nameservers here:
\`\`\`text
nameserver 8.8.8.8
\`\`\`
        `
    },
    {
      id: 'dns-howto',
      title: 'DNS HOWTO',
      category: 'System Administration',
      lastUpdated: '2001-11-23',
      obsolescenceScore: 95,
      modernEquivalent: 'Bind9 / CoreDNS',
      description: 'How to become a master of your domain using BIND 4/8.',
      sourceUrl: 'https://tldp.org/HOWTO/html_single/DNS-HOWTO/',
      content: `
# DNS HOWTO

## Named.conf
BIND is configured via \`/etc/named.conf\`.

\`\`\`text
options {
        directory "/var/named";
        forwarders { 204.152.184.88; };
};

zone "." {
        type hint;
        file "root.hints";
};
\`\`\`

## Zone Files
A typical SOA record looks like:

\`\`\`text
@ IN SOA ns.linux.org. hostmaster.linux.org. (
        199802151 ; serial
        8H ; refresh
        2H ; retry
        1W ; expire
        1D ; default_ttl
)
\`\`\`

## Testing
Use \`nslookup\` to test your configuration.
      `
    },
    {
      id: 'quota-howto',
      title: 'Quota HOWTO',
      category: 'System Administration',
      lastUpdated: '2003-08-14',
      obsolescenceScore: 89,
      modernEquivalent: 'XFS Quota / Ext4 Quota',
      description: 'Enforcing disk usage limits on users.',
      sourceUrl: 'https://tldp.org/HOWTO/html_single/Quota/',
      content: `
# Quota HOWTO

## Enabling Quotas
Edit \`/etc/fstab\` and add \`usrquota\` and \`grpquota\` to the partitions.

\`\`\`text
/dev/hda1  /  ext2  defaults,usrquota,grpquota  1 1
\`\`\`

## Initializing
Run \`quotacheck\` to create the quota files:

\`\`\`bash
quotacheck -avug
\`\`\`

## Editing Limits
Use \`edquota\` to edit a user's limits:
\`\`\`bash
edquota -u username
\`\`\`
      `
    },
    {
      id: 'virtualization-howto',
      title: 'Virtualization HOWTO',
      category: 'DevOps',
      lastUpdated: '2006-08-23',
      obsolescenceScore: 92,
      modernEquivalent: 'Docker / KVM / Podman',
      description: 'Discusses various virtualization technologies like VServer, Xen, and QEMU.',
      sourceUrl: 'https://tldp.org/HOWTO/html_single/Virtualization-HOWTO/',
      content: `
# Virtualization HOWTO

## QEMU
QEMU is a fast processor emulator. You can run a disk image like this:

\`\`\`bash
qemu -hda linux.img -boot c
\`\`\`

## Linux-VServer
Linux-VServer allows you to run multiple virtual servers on a single kernel.

## Chroot
The simplest form of virtualization is \`chroot\`.
\`\`\`bash
chroot /mnt/gentoo /bin/bash
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
