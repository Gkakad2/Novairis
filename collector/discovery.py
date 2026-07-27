import paramiko


class Discovery:

    def __init__(self, host, user="root"):
        self.host = host
        self.user = user

    def run(self, command):
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        ssh.connect(self.host, username=self.user)

        stdin, stdout, stderr = ssh.exec_command(command)

        output = stdout.read().decode()
        ssh.close()

        return output

    def collect(self):

        info = {
            "hostname": self.run("hostname"),
            "kernel": self.run("uname -r"),
            "os": self.run("cat /etc/os-release"),
            "users": self.run("cut -d: -f1 /etc/passwd"),
            "processes": self.run("ps -ef"),
            "ports": self.run("ss -tulpn"),
            "services": self.run("systemctl list-units --type=service --state=running")
        }

        return info
