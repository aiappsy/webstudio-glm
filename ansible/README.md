# Ansible playbooks for AiAppsy Web Studio

## 📋 Files

- `playbooks/` - Main playbooks for deployment
- `roles/` - Reusable roles
- `inventory/` - Host inventory files
- `group_vars/` - Group variables

## 🚀 Quick Start

```bash
# Run playbook
ansible-playbook -i inventory/hosts playbooks/deploy.yml

# Run with specific variables
ansible-playbook -i inventory/hosts playbooks/deploy.yml -e "env=production"

# Run with tags
ansible-playbook -i inventory/hosts playbooks/deploy.yml --tags database
```

## 🔧 Configuration

### Inventory
```ini
[webservers]
server1 ansible_host=192.168.1.10
server2 ansible_host=192.168.1.11

[database]
db1 ansible_host=192.168.1.20
db2 ansible_host=192.168.1.21

[all:children]
webservers
database
```

### Playbook Structure
```yaml
---
- name: Deploy AiAppsy Web Studio
  hosts: webservers
  become: yes
  vars:
    app_name: aiappsy-web-studio
    app_version: latest
    node_env: production
    
  tasks:
    - name: Update system packages
      apt:
        update_cache: yes
        upgrade: dist
        
    - name: Install Node.js
      apt:
        name: nodejs
        state: present
        
    - name: Create application directory
      file:
        path: /opt/{{ app_name }}
        state: directory
        mode: '0755'
        
    - name: Copy application files
      copy:
        src: ./
        dest: /opt/{{ app_name }}/
        exclude:
          - .git
          - node_modules
          - .next
          
    - name: Install dependencies
      npm:
        path: /opt/{{ app_name }}
        state: present
        
    - name: Build application
      command: npm run build
      args:
        chdir: /opt/{{ app_name }}
        
    - name: Create systemd service
      template:
        src: systemd.service.j2
        dest: /etc/systemd/system/{{ app_name }}.service
      vars:
        app_name: "{{ app_name }}"
        
    - name: Start and enable service
      systemd:
        name: "{{ app_name }}"
        state: started
        enabled: yes
```

## 📚 Roles

### Common Tasks
- `common` - Common system tasks
- `nodejs` - Node.js application setup
- `database` - Database configuration
- `nginx` - Web server configuration
- `security` - Security hardening

### Usage
```yaml
---
- name: Deploy with roles
  hosts: webservers
  roles:
    - common
    - nodejs
    - nginx
    - security
```