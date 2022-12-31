import {Card, Group, Text, useMantineTheme} from "@mantine/core";
import {Dropzone, DropzoneProps} from "@mantine/dropzone";
import {ReactElement, useState} from "react";
import {IconPhoto, IconUpload} from "@tabler/icons";

export interface FilePickerProps extends Omit<Omit<Omit<DropzoneProps, "children">, "onDrop">, "loading"> {
  title: string;
  subtitle: string;
  icon?: (color: string) => ReactElement;
  onFileChange: (file: Blob | null) => void;
}

export default function FilePicker(props: FilePickerProps) {
  const theme = useMantineTheme();
  const [pickedFile, setPickedFile] = useState<string | null>(null);
  return (
    <Dropzone
      onDrop={async (file) => {
        const buffer = await file[0].arrayBuffer();
        props.onFileChange(new Blob([buffer], {type: file[0].type}));
        setPickedFile(file[0].name);
      }}
      {...props}>
      {pickedFile ?
        <Card>
          <Group>
            <IconPhoto strokeWidth={1}/>
            <Text>{pickedFile}</Text>
          </Group>
        </Card>
        :
        <Group position="center" spacing="xl" sx={{pointerEvents: 'none'}}>
          <Dropzone.Accept>
            <IconUpload
              style={{color: theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]}}
              size={60}/>
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconUpload style={{color: theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}} size={60}/>
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconUpload style={{
              color: theme.colorScheme === 'dark'
                ? theme.colors.dark[0]
                : theme.colors.gray[7]
            }} size={60}/>
          </Dropzone.Idle>

          <div>
            <Text size="lg" inline>
              {props.title}
            </Text>
            <Text size="xs" color="dimmed" inline mt={7}>
              {props.subtitle}
            </Text>
          </div>
        </Group>
      }
    </Dropzone>
  );
}
